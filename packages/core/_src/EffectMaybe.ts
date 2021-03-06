/* eslint-disable @typescript-eslint/no-explicit-any */
import { Effect, service } from "@effect-ts/core/Effect"
import type { Either } from "@effect-ts/core/Either"
import type { Has, Tag } from "@effect-ts/core/Has"
import * as MaybeT from "@effect-ts/core/OptionT"
import * as P from "@effect-ts/core/Prelude"
import * as DSL from "@effect-ts/core/Prelude/DSL"
import { intersect } from "@effect-ts/core/Utils"
import * as Utils from "@effect-ts/core/Utils"
import { _A, _E, _R, fromEither } from "@effect-ts/system/Effect"

import * as T from "./Effect.js"
import * as F from "./Function.js"
import { flow, pipe } from "./Function.js"
import type { Maybe } from "./Maybe.js"
import * as O from "./Maybe.js"

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

export interface EffectMaybe<R, E, A> extends T.Effect<R, E, O.Maybe<A>> {}
export type UIO<A> = EffectMaybe<unknown, never, A>
export type IO<E, A> = EffectMaybe<unknown, E, A>
export type RIO<R, E, A> = EffectMaybe<R, E, A>

export const fromNullable = <A>(a: A): UIO<NonNullable<A>> =>
  T.succeed(O.fromNullable(a))

export const toNullable = <R, E, A>(eff: EffectMaybe<R, E, A>) =>
  pipe(eff, T.map(O.toNullable))

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
): EffectMaybe<unknown, never, NonNullable<T>> =>
  T.tryPromise(taskCreator).orDie().map(O.fromNullable)

export const encaseNullableTaskErrorIfNull = <T, E>(
  taskCreator: F.Lazy<Promise<T | null>>,
  makeError: F.Lazy<E>
): T.Effect<unknown, E, NonNullable<T>> =>
  pipe(
    encaseNullableTask(taskCreator),
    T.chain(O.fold(() => T.fail(makeError()), T.succeed))
  )
export const encaseEither = flow(T.encaseEither, fromEffect)

export function asUnit<R, E, X>(self: EffectMaybe<R, E, X>, __trace?: string) {
  return chainEffect_(self, () => T.unit, __trace)
}

/**
 * Leverage the EffectMaybe to optionally process computation.
 * But then ignore the final result.
 * Useful for use in generators, not to short-circuit the operation on the None case.
 */
export const asUnitDiscard = T.asUnit

export const map_ = <R, E, A, B>(
  fa: EffectMaybe<R, E, A>,
  f: (a: A) => B
): EffectMaybe<R, E, B> => T.map_(fa, O.map(f))

export const flatMap_ = <R, E, A, R2, E2, B>(
  fa: EffectMaybe<R, E, A>,
  f: (a: A) => EffectMaybe<R2, E2, B>,
  __trace?: string
): EffectMaybe<R & R2, E | E2, B> =>
  T.chain_(
    fa,
    O.fold(() => none, f),
    __trace
  )

export const chain_ = flatMap_

export const tap_ = <R, E, A, R2, E2>(
  inner: EffectMaybe<R, E, A>,
  bind: FunctionN<[A], T.Effect<R2, E2, unknown>>
): EffectMaybe<R & R2, E | E2, A> =>
  T.tap_(
    inner,
    O.fold(() => none, bind)
  )

export const ap_ = <R, E, A, B, R2, E2>(
  fab: EffectMaybe<R, E, (a: A) => B>,
  fa: EffectMaybe<R2, E2, A>
): EffectMaybe<R & R2, E | E2, B> => T.zipWith_(fab, fa, O.ap_)

export const apFirst: <R, E, B>(
  fb: EffectMaybe<R, E, B>
) => <A, R2, E2>(fa: EffectMaybe<R2, E2, A>) => EffectMaybe<R & R2, E | E2, A> =
  (fb) => (fa) =>
    ap_(
      map_(fa, (a) => () => a),
      fb
    )

export const apFirst_: <A, R2, E2, R, E, B>(
  fa: EffectMaybe<R2, E2, A>,
  fb: EffectMaybe<R, E, B>
) => EffectMaybe<R & R2, E | E2, A> = (fa, fb) =>
  ap_(
    map_(fa, (a) => () => a),
    fb
  )

export const apSecond =
  <R, E, B>(fb: EffectMaybe<R, E, B>) =>
  <A, R2, E2>(fa: EffectMaybe<R2, E2, A>): EffectMaybe<R & R2, E | E2, B> =>
    ap_(
      map_(fa, () => (b: B) => b),
      fb
    )

export const apSecond_ = <A, R2, E2, R, E, B>(
  fa: EffectMaybe<R2, E2, A>,
  fb: EffectMaybe<R, E, B>
): EffectMaybe<R & R2, E | E2, B> =>
  ap_(
    map_(fa, () => (b: B) => b),
    fb
  )

/**
 * Like chain but ignores the input
 */
export function zipRight<R1, E1, A1>(fb: EffectMaybe<R1, E1, A1>) {
  return <R, E, A>(fa: EffectMaybe<R, E, A>) => zipRight_(fa, fb)
}

/**
 * Like chain but ignores the input
 */
export function zipRight_<R, E, A, R1, E1, A1>(
  fa: EffectMaybe<R, E, A>,
  fb: EffectMaybe<R1, E1, A1>
) {
  return chain_(fa, () => fb)
}

export const fromMaybe = <A>(a: O.Maybe<A>): UIO<A> => T.succeed(a)

export const alt_ = <R, E, A, R2, E2, A2>(
  _: EffectMaybe<R, E, A>,
  f: () => EffectMaybe<R2, E2, A2>
) => T.chain_(_, (x) => (O.isNone(x) ? f() : T.succeed(x as O.Maybe<A | A2>)))

export const alt =
  <R2, E2, A2>(f: () => EffectMaybe<R2, E2, A2>) =>
  <R, E, A>(_: EffectMaybe<R, E, A>): EffectMaybe<R & R2, E | E2, A | A2> =>
    alt_(_, f)

export const getOrElse_ = <R, E, A, A2>(
  _: EffectMaybe<R, E, A>,
  f: () => A2
): Effect<R, E, A | A2> => T.map_(_, (x) => (O.isNone(x) ? f() : x.value))

export const getOrElse =
  <A2>(f: () => A2) =>
  <R, E, A>(_: EffectMaybe<R, E, A>): Effect<R, E, A | A2> =>
    getOrElse_(_, f)

export const getOrFail_ = <R, E, E2, A>(_: EffectMaybe<R, E, A>, onErr: () => E2) =>
  T.chain_(_, (o) => (O.isSome(o) ? T.succeed(o.value) : T.fail(onErr())))

export const getOrFail =
  <E2>(onErr: () => E2) =>
  <R, E, A>(_: EffectMaybe<R, E, A>) =>
    getOrFail_(_, onErr)

export const tap = <R, E, A>(bind: (a: A) => T.Effect<R, E, unknown>) =>
  T.tap(O.fold(() => none, bind))

export const fromMaybeS = <R, E, A>(
  onNone: T.Effect<R, E, O.Maybe<A>>
): ((opt: O.Maybe<A>) => EffectMaybe<R, E, A>) => O.fold(() => onNone, some)

export const fromEffectMaybeS =
  <R, R2, E, E2, A>(onNone: EffectMaybe<R, E, A>) =>
  (eff: EffectMaybe<R2, E2, A>) =>
    T.chain_(eff, fromMaybeS(onNone))

export const flatMapEffect_ = <R, R2, E, E2, A, A2>(
  eo: EffectMaybe<R, E, A>,
  eff: (a: A) => T.Effect<R2, E2, A2>,
  __trace?: string
) => flatMap_(eo, flow(eff, fromEffect))

export const flatMapEffect =
  <R, R2, E, E2, A, A2>(eff: (a: A) => T.Effect<R2, E2, A2>, __trace?: string) =>
  (eo: EffectMaybe<R, E, A>) =>
    flatMapEffect_(eo, eff, __trace)

export const chainEffect_ = flatMapEffect_

export const chainEffect = flatMapEffect
export class GenEffect<R, E, A> {
  readonly [_R]!: (_R: R) => void;
  readonly [_E]!: () => E;
  readonly [_A]!: () => A

  constructor(
    readonly effect: EffectMaybe<R, E, A>, // | Managed<R, E, A>,
    readonly trace?: string
  ) {}

  *[Symbol.iterator](): Generator<GenEffect<R, E, A>, A, any> {
    return yield this
  }
}

function adapter(_: any, __?: any) {
  if (Utils.isEither(_)) {
    return new GenEffect(fromEither(() => _) >= fromEffect, __)
  }
  if (Utils.isOption(_)) {
    // if (__ && typeof __ === "function") {
    //   return new GenEffect(_._tag === "None" ? fail(__()) : succeed(_.value), ___)
    // }
    return new GenEffect(fromMaybe(_), __)
  }
  if (Utils.isTag(_)) {
    return new GenEffect(service(_) >= fromEffect, __)
  }
  return new GenEffect(pipe(_, fromEffectIf), __)
}

export interface Adapter {
  <A>(_: Tag<A>, __trace?: string): GenEffect<Has<A>, never, A>

  <A>(_: Maybe<A>, __trace?: string): GenEffect<unknown, never, A>
  <E, A>(_: Either<E, A>, __trace?: string): GenEffect<unknown, E, A>
  <R, E, A>(_: EffectMaybe<R, E, A>, __trace?: string): GenEffect<R, E, A>
  <R, E, A>(_: Effect<R, E, A>, __trace?: string): GenEffect<R, E, A>
}

export const gen = DSL.genF(Monad, { adapter: adapter as Adapter })

/**
 * Leverage the EffectMaybe to optionally process computation.
 * But then ignore the final result.
 * Useful for use in generators, not to short-circuit the operation on the None case.
 */
export const genUnit = flow(gen, asUnitDiscard)

export * as $ from "./EffectMaybeAspects.js"
