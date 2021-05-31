/* eslint-disable @typescript-eslint/no-explicit-any */
import { DSL } from "@effect-ts/core"
import { Either } from "@effect-ts/core/Either"
import { Has, Tag } from "@effect-ts/core/Has"
import * as OptionT from "@effect-ts/core/OptionT"
import * as P from "@effect-ts/core/Prelude"
import { intersect } from "@effect-ts/core/Utils"
import * as Utils from "@effect-ts/core/Utils"

import { flow, pipe } from "./Function"
import * as O from "./Option"
import * as T from "./Sync"
import { GenSync, service, Sync } from "./Sync"

export const Monad = OptionT.monad(T.Monad)
export const Applicative = OptionT.applicative(T.Applicative)

export const { any, both, flatten, map } = intersect(Monad, Applicative)

export const chain = P.chainF(Monad)
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

export interface SyncOption<R, E, A> extends T.Sync<R, E, O.Option<A>> {}
export type UIO<A> = SyncOption<unknown, never, A>
export type IO<E, A> = SyncOption<unknown, E, A>
export type RIO<R, E, A> = SyncOption<R, E, A>

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
  fa: SyncOption<R, E, A>,
  f: (a: A) => B
): SyncOption<R, E, B> => T.map_(fa, O.map(f))

export const chain_ = <R, E, A, R2, E2, B>(
  fa: SyncOption<R, E, A>,
  f: (a: A) => SyncOption<R2, E2, B>
): SyncOption<R & R2, E | E2, B> =>
  T.chain_(
    fa,
    O.fold(() => none, f)
  )

export const tap_ = <R, E, A, R2, E2>(
  inner: SyncOption<R, E, A>,
  bind: FunctionN<[A], T.Sync<R2, E2, unknown>>
): SyncOption<R & R2, E | E2, A> =>
  T.tap_(
    inner,
    O.fold(() => none, bind)
  )

export const ap_ = <R, E, A, B, R2, E2>(
  fab: SyncOption<R, E, (a: A) => B>,
  fa: SyncOption<R2, E2, A>
): SyncOption<R & R2, E | E2, B> => T.zipWith_(fab, fa, O.ap_)

export const apFirst: <R, E, B>(
  fb: SyncOption<R, E, B>
) => <A, R2, E2>(fa: SyncOption<R2, E2, A>) => SyncOption<R & R2, E | E2, A> =
  (fb) => (fa) =>
    ap_(
      map_(fa, (a) => () => a),
      fb
    )

export const apFirst_: <A, R2, E2, R, E, B>(
  fa: SyncOption<R2, E2, A>,
  fb: SyncOption<R, E, B>
) => SyncOption<R & R2, E | E2, A> = (fa, fb) =>
  ap_(
    map_(fa, (a) => () => a),
    fb
  )

export const apSecond =
  <R, E, B>(fb: SyncOption<R, E, B>) =>
  <A, R2, E2>(fa: SyncOption<R2, E2, A>): SyncOption<R & R2, E | E2, B> =>
    ap_(
      map_(fa, () => (b: B) => b),
      fb
    )

export const apSecond_ = <A, R2, E2, R, E, B>(
  fa: SyncOption<R2, E2, A>,
  fb: SyncOption<R, E, B>
): SyncOption<R & R2, E | E2, B> =>
  ap_(
    map_(fa, () => (b: B) => b),
    fb
  )

/**
 * Like chain but ignores the input
 */
export function zipRight<R1, E1, A1>(fb: SyncOption<R1, E1, A1>) {
  return <R, E, A>(fa: SyncOption<R, E, A>) => zipRight_(fa, fb)
}

/**
 * Like chain but ignores the input
 */
export function zipRight_<R, E, A, R1, E1, A1>(
  fa: SyncOption<R, E, A>,
  fb: SyncOption<R1, E1, A1>
) {
  return chain_(fa, () => fb)
}

export const fromOption = <A>(a: O.Option<A>): UIO<A> => T.succeed(a)

export const mapNone =
  <A2>(f: () => A2) =>
  <R, E, A>(_: SyncOption<R, E, A>): SyncOption<R, E, A | A2> =>
    T.map_(_, (x) => (O.isNone(x) ? O.some(f()) : x))

export const chainNone =
  <R2, E2, A2>(f: SyncOption<R2, E2, A2>) =>
  <R, E, A>(_: SyncOption<R, E, A>): SyncOption<R & R2, E | E2, A | A2> =>
    T.chain_(_, (x) => (O.isNone(x) ? f : T.succeed(x as O.Option<A | A2>)))

export const tap = <R, E, A>(bind: FunctionN<[A], T.Sync<R, E, unknown>>) =>
  T.tap(O.fold(() => none, bind))

export const fromOptionS = <R, E, A>(
  onNone: T.Sync<R, E, O.Option<A>>
): ((opt: O.Option<A>) => SyncOption<R, E, A>) => O.fold(() => onNone, some)

export const fromSyncOptionS =
  <R, R2, E, E2, A>(onNone: SyncOption<R, E, A>) =>
  (eff: SyncOption<R2, E2, A>) =>
    T.chain_(eff, fromOptionS(onNone))

export const chainEffect =
  <R, R2, E, E2, A, A2>(eff: (a: A) => T.Sync<R2, E2, A2>) =>
  (eo: SyncOption<R, E, A>) =>
    chain_(eo, flow(eff, fromSync))

function adapter(_: any) {
  if (Utils.isEither(_)) {
    return new GenSync(T.fromEither(() => _)["|>"](fromSync))
  }
  if (Utils.isOption(_)) {
    return new GenSync(fromOption(_))
  }
  if (Utils.isTag(_)) {
    return new GenSync(service(_)["|>"](fromSync))
  }
  return new GenSync(_["|>"](fromSyncIf))
}

export interface Adapter {
  <A>(_: Tag<A>): GenSync<Has<A>, never, A>

  <E, A>(_: O.Option<A>): GenSync<unknown, E, A>
  <E, A>(_: Either<E, A>): GenSync<unknown, E, A>
  <R, E, A>(_: SyncOption<R, E, A>): GenSync<R, E, A>
  <R, E, A>(_: Sync<R, E, A>): GenSync<R, E, A>
}

export const gen = DSL.genF(Monad, { adapter: adapter as Adapter })
