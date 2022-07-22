import { Effect } from "@effect-ts-app/core/Prelude"

import { pipe } from "./pipe.js"

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
 * @tsplus fluent ets/Effect flatMap
 */
export const flatMapEffect = Effect.chain_

/**
 * @tsplus fluent ets/Effect map
 */
export const mapEffect = Effect.map_

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
 * @tsplus fluent ets/Effect tapMaybe
 */
export const tapEffectMaybe = EffectMaybe.tap_

/**
 * @tsplus static ets/Effect __call
 */
export const effectSucceed = Effect.succeed

/**
 * @tsplus operator ets/Effect >=
 * @tsplus fluent ets/Effect apply
 * @tsplus fluent ets/Effect __call
 * @tsplus macro pipe
 */
export const pipeEffect = pipe
