import { pipe } from "./pipe.js"

/**
 * @tsplus fluent ets/NESet pipe
 * @tsplus fluent ets/NESet __call
 * @tsplus macro pipe
 */
export const pipeNESet = pipe

/**
 * @tsplus fluent ets/Set pipe
 * @tsplus fluent ets/Set __call
 * @tsplus macro pipe
 */
export const pipeSet = pipe

/**
 * @tsplus fluent Array pipe
 * @tsplus fluent Array __call
 * @tsplus fluent ReadonlyArray pipe
 * @tsplus fluent ReadonlyArray __call
 * @tsplus macro pipe
 */
export const pipeArray = pipe

/**
 * @tsplus fluent effect/data/Chunk pipe
 * @tsplus fluent effect/data/Chunk __call
 * @tsplus macro pipe
 */
export const pipeChunk = pipe

/**
 * @tsplus fluent effect/io/Effect pipe
 * @tsplus fluent effect/io/Effect __call
 * @tsplus macro pipe
 */
export const pipeEffect = pipe

/**
 * @tsplus type tsplus/ForceLazyArgument
 */
export interface ForceLazyArg<A> {
  (): A
}
