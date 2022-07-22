/* eslint-disable @typescript-eslint/no-explicit-any */
import { Either } from "@effect-ts/core/Either"
import { Has, Tag } from "@effect-ts/core/Has"
import * as MaybeT from "@effect-ts/core/OptionT"
import * as P from "@effect-ts/core/Prelude"
import * as DSL from "@effect-ts/core/Prelude/DSL"
import { intersect } from "@effect-ts/core/Utils"
import * as Utils from "@effect-ts/core/Utils"

import { flow, pipe } from "./Function.js"
import * as O from "./Maybe.js"
import * as T from "./Sync.js"
import { GenSync, service, Sync } from "./Sync.js"

export const Monad = MaybeT.monad(T.Monad)
export const Applicative = MaybeT.applicative(T.Applicative)

export const { any, both, flatten, map } = intersect(Monad, Applicative)

export const flatMap = P.chainF(Monad)
export const chain = flatMap
export const succeed = P.succeedF(Monad)
export const ap = P.apF(Applicative)
export const bind = P.bindF(Monad)
const do_ = P.doF(Monad)
export { do_ as do }
export const struct = P.structF(Applicative)
export const tuple = P.tupleF(Applicative)

export interface FunctionN<A extends ReadonlyArray<unknown>, B> {
  (...args: A): B
}

export interface SyncMaybe<R, E, A> extends T.Sync<R, E, O.Maybe<A>> {}
export type UIO<A> = SyncMaybe<unknown, never, A>
export type IO<E, A> = SyncMaybe<unknown, E, A>
export type RIO<R, E, A> = SyncMaybe<R, E, A>

export const fromNullable = <A>(a: A) => T.succeed(O.fromNullable(a))

export const some = <A>(a: A): UIO<A> => T.succeed(O.some(a))

export const none: UIO<never> =
  /*#__PURE__*/
  (() => T.succeed(O.none))()

export const fromSync = <R, E, A>(eff: T.Sync<R, E, A>) => pipe(eff, T.map(O.some))
export const fromSyncIf = <R, E, A>(eff: T.Sync<R, E, A>) =>
  pipe(
    eff,
    T.map((x) => (Utils.isOption(x) ? x : O.some(x)))
  )

export const encaseEither = flow(T.encaseEither, fromSync)

export const map_ = <R, E, A, B>(
  fa: SyncMaybe<R, E, A>,
  f: (a: A) => B
): SyncMaybe<R, E, B> => T.map_(fa, O.map(f))

export const flatMap_ = <R, E, A, R2, E2, B>(
  fa: SyncMaybe<R, E, A>,
  f: (a: A) => SyncMaybe<R2, E2, B>
): SyncMaybe<R & R2, E | E2, B> =>
  T.chain_(
    fa,
    O.fold(() => none, f)
  )

export const chain_ = flatMap_

export const tap_ = <R, E, A, R2, E2>(
  inner: SyncMaybe<R, E, A>,
  bind: FunctionN<[A], T.Sync<R2, E2, unknown>>
): SyncMaybe<R & R2, E | E2, A> =>
  T.tap_(
    inner,
    O.fold(() => none, bind)
  )

export const ap_ = <R, E, A, B, R2, E2>(
  fab: SyncMaybe<R, E, (a: A) => B>,
  fa: SyncMaybe<R2, E2, A>
): SyncMaybe<R & R2, E | E2, B> => T.zipWith_(fab, fa, O.ap_)

export const apFirst: <R, E, B>(
  fb: SyncMaybe<R, E, B>
) => <A, R2, E2>(fa: SyncMaybe<R2, E2, A>) => SyncMaybe<R & R2, E | E2, A> =
  (fb) => (fa) =>
    ap_(
      map_(fa, (a) => () => a),
      fb
    )

export const apFirst_: <A, R2, E2, R, E, B>(
  fa: SyncMaybe<R2, E2, A>,
  fb: SyncMaybe<R, E, B>
) => SyncMaybe<R & R2, E | E2, A> = (fa, fb) =>
  ap_(
    map_(fa, (a) => () => a),
    fb
  )

export const apSecond =
  <R, E, B>(fb: SyncMaybe<R, E, B>) =>
  <A, R2, E2>(fa: SyncMaybe<R2, E2, A>): SyncMaybe<R & R2, E | E2, B> =>
    ap_(
      map_(fa, () => (b: B) => b),
      fb
    )

export const apSecond_ = <A, R2, E2, R, E, B>(
  fa: SyncMaybe<R2, E2, A>,
  fb: SyncMaybe<R, E, B>
): SyncMaybe<R & R2, E | E2, B> =>
  ap_(
    map_(fa, () => (b: B) => b),
    fb
  )

/**
 * Like chain but ignores the input
 */
export function zipRight<R1, E1, A1>(fb: SyncMaybe<R1, E1, A1>) {
  return <R, E, A>(fa: SyncMaybe<R, E, A>) => zipRight_(fa, fb)
}

/**
 * Like chain but ignores the input
 */
export function zipRight_<R, E, A, R1, E1, A1>(
  fa: SyncMaybe<R, E, A>,
  fb: SyncMaybe<R1, E1, A1>
) {
  return chain_(fa, () => fb)
}

export const fromMaybe = <A>(a: O.Maybe<A>): UIO<A> => T.succeed(a)

export const getOrElse_ = <R, E, A, A2>(
  _: SyncMaybe<R, E, A>,
  f: () => A2
): Sync<R, E, A | A2> => T.map_(_, (x) => (O.isNone(x) ? f() : x.value))

export const alt_ = <R, E, A, R2, E2, A2>(
  _: SyncMaybe<R, E, A>,
  f: () => SyncMaybe<R2, E2, A2>
) => T.chain_(_, (x) => (O.isNone(x) ? f() : T.succeed(x as O.Maybe<A | A2>)))

export const alt =
  <R2, E2, A2>(f: () => SyncMaybe<R2, E2, A2>) =>
  <R, E, A>(_: SyncMaybe<R, E, A>): SyncMaybe<R & R2, E | E2, A | A2> =>
    alt_(_, f)

export const getOrElse =
  <A2>(f: () => A2) =>
  <R, E, A>(_: SyncMaybe<R, E, A>): Sync<R, E, A | A2> =>
    getOrElse_(_, f)

export const tap = <R, E, A>(bind: FunctionN<[A], T.Sync<R, E, unknown>>) =>
  T.tap(O.fold(() => none, bind))

export const fromMaybeS = <R, E, A>(
  onNone: T.Sync<R, E, O.Maybe<A>>
): ((opt: O.Maybe<A>) => SyncMaybe<R, E, A>) => O.fold(() => onNone, some)

export const fromSyncMaybeS =
  <R, R2, E, E2, A>(onNone: SyncMaybe<R, E, A>) =>
  (eff: SyncMaybe<R2, E2, A>) =>
    T.chain_(eff, fromMaybeS(onNone))

export const flatMapSync_ = <R, R2, E, E2, A, A2>(
  eo: SyncMaybe<R, E, A>,
  eff: (a: A) => T.Sync<R2, E2, A2>
) => flatMap_(eo, flow(eff, fromSync))

export const flatMapSync =
  <R, R2, E, E2, A, A2>(eff: (a: A) => T.Sync<R2, E2, A2>) =>
  (eo: SyncMaybe<R, E, A>) =>
    flatMapSync_(eo, eff)

export const chainSync_ = flatMapSync_
export const chainSync = flatMapSync

export const toNullable = <R, E, A>(eff: SyncMaybe<R, E, A>) =>
  pipe(eff, T.map(O.toNullable))

function adapter(_: any) {
  if (Utils.isEither(_)) {
    return new GenSync(T.fromEither(() => _) >= fromSync)
  }
  if (Utils.isOption(_)) {
    return new GenSync(fromMaybe(_))
  }
  if (Utils.isTag(_)) {
    return new GenSync(service(_) >= fromSync)
  }
  return new GenSync(pipe(_, fromSyncIf))
}

export const getOrFail_ = <R, E, E2, A>(_: SyncMaybe<R, E, A>, onErr: () => E2) =>
  T.chain_(_, (o) => (O.isSome(o) ? T.succeed(o.value) : T.fail(onErr())))

export const getOrFail =
  <E2>(onErr: () => E2) =>
  <R, E, A>(_: SyncMaybe<R, E, A>) =>
    getOrFail_(_, onErr)

export interface Adapter {
  <A>(_: Tag<A>): GenSync<Has<A>, never, A>

  <E, A>(_: O.Maybe<A>): GenSync<unknown, E, A>
  <E, A>(_: Either<E, A>): GenSync<unknown, E, A>
  <R, E, A>(_: SyncMaybe<R, E, A>): GenSync<R, E, A>
  <R, E, A>(_: Sync<R, E, A>): GenSync<R, E, A>
}

export const gen = DSL.genF(Monad, { adapter: adapter as Adapter })

export * as $ from "./SyncMaybeAspects.js"
