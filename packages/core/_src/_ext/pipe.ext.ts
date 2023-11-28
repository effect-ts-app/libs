import { pipe } from "./pipe.js"

/**
 * @tsplus operator ets/NESet >=
 * @tsplus fluent ets/NESet pipe
 * @tsplus fluent ets/NESet __call
 * @tsplus macro pipe
 */
export const pipeNESet = pipe

/**
 * @tsplus operator ets/Set >=
 * @tsplus fluent ets/Set pipe
 * @tsplus fluent ets/Set __call
 * @tsplus macro pipe
 */
export const pipeSet = pipe

/**
 * @tsplus operator Array >=
 * @tsplus fluent Array pipe
 * @tsplus fluent Array __call
 * @tsplus operator ReadonlyArray >=
 * @tsplus fluent ReadonlyArray pipe
 * @tsplus fluent ReadonlyArray __call
 * @tsplus macro pipe
 */
export const pipeArray = pipe

/**
 * @tsplus operator effect/data/Chunk >=
 * @tsplus fluent effect/data/Chunk pipe
 * @tsplus fluent effect/data/Chunk __call
 * @tsplus macro pipe
 */
export const pipeChunk = pipe

/**
 * @tsplus operator effect/io/Effect >=
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
