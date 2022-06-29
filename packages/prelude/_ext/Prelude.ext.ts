//import "./Lens.ext"
import "./Schema.ext.js"

// import {
//   Chunk,
//   Effect,
//   EffectOption,
//   NonEmptyArray,
//   Option,
//   Set,
//   Sync,
// } from "@effect-ts-app/prelude"
import { pipe } from "./pipe.js"

/**
 * @tsplus type tsplus/LazyArgument
 */
export interface LazyArg<A> {
  (): A
}

// NOTE: unify functions only work if the @tsplus type tag is on the original definition, not on prelude's definitions.
/**
 * @tsplus unify ets/Effect
 */
export function unifyEffect<X extends Effect<any, any, any>>(
  self: X
): Effect<
  [X] extends [{ [Effect._R]: (_: infer R) => void }] ? R : never,
  [X] extends [{ [Effect._E]: () => infer E }] ? E : never,
  [X] extends [{ [Effect._A]: () => infer A }] ? A : never
> {
  return self
}

/**
 * @tsplus unify ets/Sync
 */
export function unifySync<X extends Sync<any, any, any>>(
  self: X
): Sync<
  [X] extends [{ [Effect._R]: (_: infer R) => void }] ? R : never,
  [X] extends [{ [Effect._E]: () => infer E }] ? E : never,
  [X] extends [{ [Effect._A]: () => infer A }] ? A : never
> {
  return self
}

/**
 * @tsplus unify Either
 * @tsplus unify Either/Left
 * @tsplus unify Either/Right
 */
export function unifyEither<X extends Either<any, any>>(
  self: X
): Either<
  [X] extends [Either<infer EX, any>] ? EX : never,
  [X] extends [Either<any, infer AX>] ? AX : never
> {
  return self
}

/**
 * @tsplus unify Option
 * @tsplus unify Option/Some
 * @tsplus unify Option/None
 */
export function unifyOption<X extends Option<any>>(
  self: X
): Option<[X] extends [Option<infer A>] ? A : never> {
  return self
}

/**
 * @tsplus fluent ets/Effect flatMap
 */
export const flatMapEffect = Effect.chain_

/**
 * @tsplus fluent ets/Effect map
 */
export const mapEffect = Effect.map_
/**
 * @tsplus fluent ets/Sync flatMap
 */
export const flatMapSync = Sync.chain_

/**
 * @tsplus fluent ets/Sync map
 */
export const mapSync = Sync.map_

/**
 * @tsplus fluent ets/Option flatMap
 */
export const flatMapOption = Option.chain_

/**
 * @tsplus fluent ets/Option map
 */
export const mapOption = Option.map_

/**
 * @tsplus fluent ets/Either flatMap
 */
export const flatMapEither = Either.chain_

/**
 * @tsplus fluent ets/Either map
 */
export const mapEither = Either.map_

// TODO: + for zipFlatten..
// /**
//  * Sequentially zips this effect with the specified effect
//  *
//  * @tsplus operator ets/Effect +
//  * @tsplus fluent ets/Effect zipFlatten
//  */
//  export function zipFlatten_<R, E, A, R2, E2, A2>(
//   self: Effect<R, E, A>,
//   that: LazyArg<Effect<R2, E2, A2>>,
//   __tsplusTrace?: string
// ): Effect<R & R2, E | E2, MergeTuple<A, A2>> {
//   return self.zipWith(that, Tuple.mergeTuple);
// }

/**
 * @tsplus operator ets/Effect >=
 * @tsplus fluent ets/Effect apply
 * @tsplus fluent ets/Effect __call
 * @tsplus macro pipe
 */
export const pipeEffect = pipe

/**
 * @tsplus operator ets/XPure >=
 * @tsplus fluent ets/XPure apply
 * @tsplus fluent ets/XPure __call
 * @tsplus macro pipe
 */
export const pipeXPure = pipe

/**
 * @tsplus operator ets/NESet >=
 * @tsplus fluent ets/NESet apply
 * @tsplus fluent ets/NESet __call
 * @tsplus macro pipe
 */
export const pipeNESet = pipe

/**
 * @tsplus operator ets/Set >=
 * @tsplus fluent ets/Set apply
 * @tsplus fluent ets/Set __call
 * @tsplus macro pipe
 */
export const pipeSet = pipe

/**
 * @tsplus operator ets/Array >=
 * @tsplus fluent ets/Array apply
 * @tsplus fluent ets/Array __call
 * @tsplus macro pipe
 */
export const pipeArray = pipe

/**
 * @tsplus operator ets/Option >=
 * @tsplus fluent ets/Option apply
 * @tsplus fluent ets/Option __call
 * @tsplus macro pipe
 */
export const pipeOption = pipe

/**
 * @tsplus operator ets/Either >=
 * @tsplus fluent ets/Either apply
 * @tsplus fluent ets/Either __call
 * @tsplus macro pipe
 */
export const pipeEither = pipe

/**
 * @tsplus operator ets/Sync >=
 * @tsplus fluent ets/Sync apply
 * @tsplus fluent ets/Sync __call
 * @tsplus macro pipe
 */
export const pipeSync = pipe

// Have to define them here or it will try importing from effect-ts/system
/**
 * A variant of `flatMap` that ignores the value produced by this effect.
 *
 * @tsplus fluent ets/Effect zipRight
 * @tsplus operator ets/Effect >
 */
export function effectZipRight_<R, E, A, R2, E2, A2>(
  a: Effect<R, E, A>,
  b: Effect<R2, E2, A2>,
  __trace?: string
): Effect<R & R2, E | E2, A2> {
  return Effect.zipRight_(a, b, __trace)
}

/**
 * A variant of `flatMap` that ignores the value produced by this effect.
 *
 * @tsplus fluent ets/Sync zipRight
 * @tsplus operator ets/Sync >
 */
export function syncZipRight_<R, E, A, R2, E2, A2>(
  a: Sync<R, E, A>,
  b: Sync<R2, E2, A2>
): Sync<R & R2, E | E2, A2> {
  return Sync.chain_(a, () => b)
}

/**
 * A variant of `flatMap` that ignores the value produced by this effect.
 *
 * @tsplus fluent ets/Managed zipRight
 * @tsplus operator ets/Managed >
 */
export function managedZipRight_<R, E, A, R2, E2, A2>(
  a: Managed<R, E, A>,
  b: Managed<R2, E2, A2>
): Managed<R & R2, E | E2, A2> {
  return Managed.zipRight_(a, b)
}

/**
 * @tsplus fluent ets/Effect tapOption
 */
export const tapEffectOption = EffectOption.tap_

/**
 * @tsplus fluent ets/Option encaseInEither
 */
export const optionEncaseEither = Either.fromOption_

/**
 * @tsplus fluent ets/Either mapLeft
 */
export const eitherMapLeft = Either.mapLeft_

/**
 * @tsplus static ets/Option __call
 */
export const optionSome = Option.some

/**
 * @tsplus static ets/EffectOption __call
 */
export const effectOptionSome = EffectOption.some

/**
 * @tsplus static ets/Effect __call
 */
export const effectSucceed = Effect.succeed

/**
 * @tsplus static ets/Sync __call
 */
export const syncSucceed = Sync.succeed

/**
 * @tsplus static ets/NonEmptyArray __call
 */
export const naSucceed = NonEmptyArray.fromArray

/**
 * @tsplus static ets/Set __call
 */
export const setSucceed = ROSet.fromArray

/**
 * @tsplus static ets/Chunk __call
 */
export const chunkSucceed = Chunk.from

/**
 * @tsplus operator ets/Schema >=
 * @tsplus fluent ets/Schema apply
 * @tsplus fluent ets/Schema __call
 * @tsplus macro pipe
 */
export const pipeSchema = pipe

/**
 * @tsplus operator ets/Schema/Property >=
 * @tsplus fluent ets/Schema/Property apply
 * @tsplus fluent ets/Schema/Property __call
 * @tsplus macro pipe
 */
export const pipeSchemaProperty = pipe

/**
 * @tsplus operator ets/Schema/Constructor >=
 * @tsplus fluent ets/Schema/Constructor apply
 * @tsplus fluent ets/Schema/Constructor __call
 * @tsplus macro pipe
 */
export const pipeSchemaConstructor = pipe

/**
 * @tsplus operator ets/Schema/Parser >=
 * @tsplus fluent ets/Schema/Parser apply
 * @tsplus fluent ets/Schema/Parser __call
 * @tsplus macro pipe
 */
export const pipeSchemaParser = pipe

/**
 * @tsplus operator ets/Schema/These >=
 * @tsplus fluent ets/Schema/These apply
 * @tsplus fluent ets/Schema/These __call
 * @tsplus macro pipe
 */
export const pipeSchemaThese = pipe

// /**
//  * @tsplus fluent global isNotNullish
//  */
// export const isNotNullish = isTruthy

// /**
//  * @tsplus getter global asOpt
//  */
// export function asOpt<A>(a: A | null | undefined): Option<A> | undefined
// export function asOpt<A>(a: A | null): Option<A>
// export function asOpt<A>(a: A | null | undefined) {
//   return a === undefined ? a : Option.fromNullable(a)
// }

// /**
//  * @tsplus getter global asOpt2
//  */
// export const optionFromNullable = Option.fromNullable
