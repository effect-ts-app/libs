import { Effect, Sync } from "@effect-ts-app/core/Prelude"

import { pipe } from "./pipe.js"

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
 * @tsplus fluent ets/Sync flatMap
 */
export const flatMapSync = Sync.chain_

/**
 * @tsplus fluent ets/Sync map
 */
export const mapSync = Sync.map_

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
 * @tsplus static ets/Sync __call
 */
export const syncSucceed = Sync.succeed

/**
 * @tsplus operator ets/Sync >=
 * @tsplus fluent ets/Sync apply
 * @tsplus fluent ets/Sync __call
 * @tsplus macro pipe
 */
export const pipeSync = pipe
