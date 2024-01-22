import { pipe } from "./pipe.js"

/**
 * @tsplus fluent ets/NESet pipe
 * @tsplus macro pipe
 */
export const pipeNESet = pipe

/**
 * @tsplus fluent ets/Set pipe
 * @tsplus macro pipe
 */
export const pipeSet = pipe

/**
 * @tsplus fluent Array pipe
 * @tsplus fluent ReadonlyArray pipe
 * @tsplus macro pipe
 */
export const pipeArray = pipe

/**
 * @tsplus fluent effect/data/Chunk pipe
 * @tsplus macro pipe
 */
export const pipeChunk = pipe

/**
 * @tsplus fluent effect/io/Effect pipe
 * @tsplus macro pipe
 */
export const pipeEffect = pipe

/**
 * @tsplus type tsplus/ForceLazyArgument
 */
export interface ForceLazyArg<A> {
  (): A
}
