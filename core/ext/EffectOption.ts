/* eslint-disable @typescript-eslint/no-explicit-any */
import { DSL } from "@effect-ts/core"
import type { Either } from "@effect-ts/core/Either"
import type { Has, Tag } from "@effect-ts/core/Has"
import type { Option } from "@effect-ts/core/Option"
import * as OptionT from "@effect-ts/core/OptionT"
import * as P from "@effect-ts/core/Prelude"
import { intersect } from "@effect-ts/core/Utils"
import * as Utils from "@effect-ts/core/Utils"
import { _A, _E, _R } from "@effect-ts/system/Effect/commons"
import type { Effect } from "@effect-ts/system/Effect/effect"
import { fromEither } from "@effect-ts/system/Effect/fromEither"
import { service } from "@effect-ts/system/Effect/has"

import * as T from "./Effect"
import * as F from "./Function"
import { flow, pipe } from "./Function"
import * as O from "./Option"

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

export interface EffectOption<R, E, A> extends T.Effect<R, E, O.Option<A>> {}
export type UIO<A> = EffectOption<unknown, never, A>
export type IO<E, A> = EffectOption<unknown, E, A>
export type RIO<R, E, A> = EffectOption<R, E, A>

export const fromNullable = <A>(a: A) => T.succeed(O.fromNullable(a))

export const some = <A>(a: A): UIO<A> => T.succeed(O.some(a))

export const none: UIO<never> =
  /*#__PURE__*/
  (() => T.succeed(O.none))()

export const fromEffect = <R, E, A>(eff: T.Effect<R, E, A>) => pipe(eff, T.map(O.some))

export const fromEffectIf = <R, E, A>(eff: T.Effect<R, E, A>) =>
  pipe(
    eff,
    T.map((x) => (Utils.isOption(x) ? x : O.some(x)))
  )

export const encaseNullableTask = <T>(
  taskCreator: F.Lazy<Promise<T | null>>
): T.Effect<unknown, never, O.Option<NonNullable<T>>> =>
  T.map_(T.tryPromise(taskCreator)["|>"](T.orDie), O.fromNullable)

export const encaseNullableTaskErrorIfNull = <T, E>(
  taskCreator: F.Lazy<Promise<T | null>>,
  makeError: F.Lazy<E>
): T.Effect<unknown, E, NonNullable<T>> =>
  pipe(
    encaseNullableTask(taskCreator),
    T.chain(O.fold(() => T.fail(makeError()), T.succeed))
  )
export const encaseEither = flow(T.encaseEither, fromEffect)

export function asUnit<R, E, X>(self: EffectOption<R, E, X>, __trace?: string) {
  return chainEffect_(self, () => T.unit, __trace)
}

/**
 * Leverage the EffectOption to optionally process computation.
 * But then ignore the final result.
 * Useful for use in generators, not to short-circuit the operation on the None case.
 */
export const asUnitDiscard = T.asUnit

export const map_ = <R, E, A, B>(
  fa: EffectOption<R, E, A>,
  f: (a: A) => B
): EffectOption<R, E, B> => T.map_(fa, O.map(f))

export const chain_ = <R, E, A, R2, E2, B>(
  fa: EffectOption<R, E, A>,
  f: (a: A) => EffectOption<R2, E2, B>,
  __trace?: string
): EffectOption<R & R2, E | E2, B> =>
  T.chain_(
    fa,
    O.fold(() => none, f),
    __trace
  )

export const tap_ = <R, E, A, R2, E2>(
  inner: EffectOption<R, E, A>,
  bind: FunctionN<[A], T.Effect<R2, E2, unknown>>
): EffectOption<R & R2, E | E2, A> =>
  T.tap_(
    inner,
    O.fold(() => none, bind)
  )

export const ap_ = <R, E, A, B, R2, E2>(
  fab: EffectOption<R, E, (a: A) => B>,
  fa: EffectOption<R2, E2, A>
): EffectOption<R & R2, E | E2, B> => T.zipWith_(fab, fa, O.ap_)

export const apFirst: <R, E, B>(
  fb: EffectOption<R, E, B>
) => <A, R2, E2>(fa: EffectOption<R2, E2, A>) => EffectOption<R & R2, E | E2, A> =
  (fb) => (fa) =>
    ap_(
      map_(fa, (a) => () => a),
      fb
    )

export const apFirst_: <A, R2, E2, R, E, B>(
  fa: EffectOption<R2, E2, A>,
  fb: EffectOption<R, E, B>
) => EffectOption<R & R2, E | E2, A> = (fa, fb) =>
  ap_(
    map_(fa, (a) => () => a),
    fb
  )

export const apSecond =
  <R, E, B>(fb: EffectOption<R, E, B>) =>
  <A, R2, E2>(fa: EffectOption<R2, E2, A>): EffectOption<R & R2, E | E2, B> =>
    ap_(
      map_(fa, () => (b: B) => b),
      fb
    )

export const apSecond_ = <A, R2, E2, R, E, B>(
  fa: EffectOption<R2, E2, A>,
  fb: EffectOption<R, E, B>
): EffectOption<R & R2, E | E2, B> =>
  ap_(
    map_(fa, () => (b: B) => b),
    fb
  )

/**
 * Like chain but ignores the input
 */
export function zipRight<R1, E1, A1>(fb: EffectOption<R1, E1, A1>) {
  return <R, E, A>(fa: EffectOption<R, E, A>) => zipRight_(fa, fb)
}

/**
 * Like chain but ignores the input
 */
export function zipRight_<R, E, A, R1, E1, A1>(
  fa: EffectOption<R, E, A>,
  fb: EffectOption<R1, E1, A1>
) {
  return chain_(fa, () => fb)
}

export const fromOption = <A>(a: O.Option<A>): UIO<A> => T.succeed(a)

export const mapNone =
  <A2>(f: () => A2) =>
  <R, E, A>(_: EffectOption<R, E, A>): EffectOption<R, E, A | A2> =>
    T.map_(_, (x) => (O.isNone(x) ? O.some(f()) : x))

export const chainNone =
  <R2, E2, A2>(f: EffectOption<R2, E2, A2>) =>
  <R, E, A>(_: EffectOption<R, E, A>): EffectOption<R & R2, E | E2, A | A2> =>
    T.chain_(_, (x) => (O.isNone(x) ? f : T.succeed(x as O.Option<A | A2>)))

export const tap = <R, E, A>(bind: FunctionN<[A], T.Effect<R, E, unknown>>) =>
  T.tap(O.fold(() => none, bind))

export const fromOptionS = <R, E, A>(
  onNone: T.Effect<R, E, O.Option<A>>
): ((opt: O.Option<A>) => EffectOption<R, E, A>) => O.fold(() => onNone, some)

export const fromEffectOptionS =
  <R, R2, E, E2, A>(onNone: EffectOption<R, E, A>) =>
  (eff: EffectOption<R2, E2, A>) =>
    T.chain_(eff, fromOptionS(onNone))

export const chainEffect_ = <R, R2, E, E2, A, A2>(
  eo: EffectOption<R, E, A>,
  eff: (a: A) => T.Effect<R2, E2, A2>,
  __trace?: string
) => chain_(eo, flow(eff, fromEffect))

export const chainEffect =
  <R, R2, E, E2, A, A2>(eff: (a: A) => T.Effect<R2, E2, A2>, __trace?: string) =>
  (eo: EffectOption<R, E, A>) =>
    chainEffect_(eo, eff, __trace)

export class GenEffect<R, E, A> {
  readonly [_R]!: (_R: R) => void;
  readonly [_E]!: () => E;
  readonly [_A]!: () => A

  constructor(
    readonly effect: EffectOption<R, E, A>, // | Managed<R, E, A>,
    readonly trace?: string
  ) {}

  *[Symbol.iterator](): Generator<GenEffect<R, E, A>, A, any> {
    return yield this
  }
}

function adapter(_: any, __?: any) {
  if (Utils.isEither(_)) {
    return new GenEffect(fromEither(() => _)["|>"](fromEffect), __)
  }
  if (Utils.isOption(_)) {
    // if (__ && typeof __ === "function") {
    //   return new GenEffect(_._tag === "None" ? fail(__()) : succeed(_.value), ___)
    // }
    return new GenEffect(fromOption(_), __)
  }
  if (Utils.isTag(_)) {
    return new GenEffect(service(_)["|>"](fromEffect), __)
  }
  return new GenEffect(_["|>"](fromEffectIf), __)
}

export interface Adapter {
  <A>(_: Tag<A>, __trace?: string): GenEffect<Has<A>, never, A>

  <A>(_: Option<A>, __trace?: string): GenEffect<unknown, never, A>
  <E, A>(_: Either<E, A>, __trace?: string): GenEffect<unknown, E, A>
  <R, E, A>(_: EffectOption<R, E, A>, __trace?: string): GenEffect<R, E, A>
  <R, E, A>(_: Effect<R, E, A>, __trace?: string): GenEffect<R, E, A>
}

export const gen = DSL.genF(Monad, { adapter: adapter as Adapter })

/**
 * Leverage the EffectOption to optionally process computation.
 * But then ignore the final result.
 * Useful for use in generators, not to short-circuit the operation on the None case.
 */
export const genUnit = flow(gen, asUnitDiscard)
