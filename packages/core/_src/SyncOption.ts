/* eslint-disable @typescript-eslint/no-explicit-any */
import { Either } from "@effect-ts/core/Either"
import { Has, Tag } from "@effect-ts/core/Has"
import * as OptionT from "@effect-ts/core/OptionT"
import * as P from "@effect-ts/core/Prelude"
import * as DSL from "@effect-ts/core/Prelude/DSL"
import { intersect } from "@effect-ts/core/Utils"
import * as Utils from "@effect-ts/core/Utils"

import { flow, pipe } from "./Function.js"
import { GenSync, service } from "./Sync.js"

export const Monad = OptionT.monad(Sync.Monad)
export const Applicative = OptionT.applicative(Sync.Applicative)

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

export interface SyncOption<R, E, A> extends Sync<R, E, Option<A>> {}
export type UIO<A> = SyncOption<unknown, never, A>
export type IO<E, A> = SyncOption<unknown, E, A>
export type RIO<R, E, A> = SyncOption<R, E, A>

export const fromNullable = <A>(a: A) => Sync.succeed(Option.fromNullable(a))

export const some = <A>(a: A): UIO<A> => Sync.succeed(Option.some(a))

export const none: UIO<never> =
  /*#__PURE__*/
  (() => Sync.succeed(Option.none))()

export const fromSync = <R, E, A>(eff: Sync.Sync<R, E, A>) =>
  pipe(eff, Sync.map(Option.some))
export const fromSyncIf = <R, E, A>(eff: Sync.Sync<R, E, A>) =>
  pipe(
    eff,
    Sync.map((x) => (Utils.isOption(x) ? x : Option.some(x)))
  )

export const encaseEither = flow(Sync.encaseEither, fromSync)

export const map_ = <R, E, A, B>(
  fa: SyncOption<R, E, A>,
  f: (a: A) => B
): SyncOption<R, E, B> => Sync.map_(fa, Option.map(f))

export const chain_ = <R, E, A, R2, E2, B>(
  fa: SyncOption<R, E, A>,
  f: (a: A) => SyncOption<R2, E2, B>
): SyncOption<R & R2, E | E2, B> =>
  Sync.chain_(
    fa,
    Option.fold(() => none, f)
  )

export const tap_ = <R, E, A, R2, E2>(
  inner: SyncOption<R, E, A>,
  bind: FunctionN<[A], Sync.Sync<R2, E2, unknown>>
): SyncOption<R & R2, E | E2, A> =>
  Sync.tap_(
    inner,
    Option.fold(() => none, bind)
  )

export const ap_ = <R, E, A, B, R2, E2>(
  fab: SyncOption<R, E, (a: A) => B>,
  fa: SyncOption<R2, E2, A>
): SyncOption<R & R2, E | E2, B> => Sync.zipWith_(fab, fa, Option.ap_)

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

export const fromOption = <A>(a: Option<A>): UIO<A> => Sync.succeed(a)

export const getOrElse_ = <R, E, A, A2>(
  _: SyncOption<R, E, A>,
  f: () => A2
): Sync<R, E, A | A2> => Sync.map_(_, (x) => (Option.isNone(x) ? f() : x.value))

export const alt_ = <R, E, A, R2, E2, A2>(
  _: SyncOption<R, E, A>,
  f: () => SyncOption<R2, E2, A2>
) => Sync.chain_(_, (x) => (Option.isNone(x) ? f() : Sync.succeed(x as Option<A | A2>)))

export const alt =
  <R2, E2, A2>(f: () => SyncOption<R2, E2, A2>) =>
  <R, E, A>(_: SyncOption<R, E, A>): SyncOption<R & R2, E | E2, A | A2> =>
    alt_(_, f)

export const getOrElse =
  <A2>(f: () => A2) =>
  <R, E, A>(_: SyncOption<R, E, A>): Sync<R, E, A | A2> =>
    getOrElse_(_, f)

export const tap = <R, E, A>(bind: FunctionN<[A], Sync.Sync<R, E, unknown>>) =>
  Sync.tap(Option.fold(() => none, bind))

export const fromOptionS = <R, E, A>(
  onNone: Sync.Sync<R, E, Option<A>>
): ((opt: Option<A>) => SyncOption<R, E, A>) => Option.fold(() => onNone, some)

export const fromSyncOptionS =
  <R, R2, E, E2, A>(onNone: SyncOption<R, E, A>) =>
  (eff: SyncOption<R2, E2, A>) =>
    Sync.chain_(eff, fromOptionS(onNone))

export const chainSync_ = <R, R2, E, E2, A, A2>(
  eo: SyncOption<R, E, A>,
  eff: (a: A) => Sync.Sync<R2, E2, A2>
) => chain_(eo, flow(eff, fromSync))

export const chainSync =
  <R, R2, E, E2, A, A2>(eff: (a: A) => Sync.Sync<R2, E2, A2>) =>
  (eo: SyncOption<R, E, A>) =>
    chainSync_(eo, eff)

export const toNullable = <R, E, A>(eff: SyncOption<R, E, A>) =>
  pipe(eff, Sync.map(Option.toNullable))

function adapter(_: any) {
  if (Utils.isEither(_)) {
    return new GenSync(Sync.fromEither(() => _).pipe(fromSync))
  }
  if (Utils.isOption(_)) {
    return new GenSync(fromOption(_))
  }
  if (Utils.isTag(_)) {
    return new GenSync(service(_).pipe(fromSync))
  }
  return new GenSync(pipe(_, fromSyncIf))
}

export const getOrFail_ = <R, E, E2, A>(_: SyncOption<R, E, A>, onErr: () => E2) =>
  Sync.chain_(_, (o) => (Option.isSome(o) ? Sync.succeed(o.value) : Sync.fail(onErr())))

export const getOrFail =
  <E2>(onErr: () => E2) =>
  <R, E, A>(_: SyncOption<R, E, A>) =>
    getOrFail_(_, onErr)

export interface Adapter {
  <A>(_: Tag<A>): GenSync<Has<A>, never, A>

  <E, A>(_: Option<A>): GenSync<unknown, E, A>
  <E, A>(_: Either<E, A>): GenSync<unknown, E, A>
  <R, E, A>(_: SyncOption<R, E, A>): GenSync<R, E, A>
  <R, E, A>(_: Sync<R, E, A>): GenSync<R, E, A>
}

export const gen = DSL.genF(Monad, { adapter: adapter as Adapter })
