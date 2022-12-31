import { pipe } from "./pipe.js"

/**
 * @tsplus type tsplus/LazyArgument
 */
export interface LazyArg<A> {
  (): A
}

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
 * @tsplus operator Array >=
 * @tsplus fluent Array apply
 * @tsplus fluent Array __call
 * @tsplus operator ReadonlyArray >=
 * @tsplus fluent ReadonlyArray apply
 * @tsplus fluent ReadonlyArray __call
 * @tsplus macro pipe
 */
export const pipeArray = pipe

/**
 * @tsplus operator fp-ts/data/Chunk >=
 * @tsplus fluent fp-ts/data/Chunk apply
 * @tsplus fluent fp-ts/data/Chunk __call
 * @tsplus macro pipe
 */
export const pipeChunk = pipe

/**
 * @tsplus operator effect/io/Effect >=
 * @tsplus fluent effect/io/Effect apply
 * @tsplus fluent effect/io/Effect __call
 * @tsplus macro pipe
 */
export const pipeEffect = pipe

/**
 * @tsplus static ets/Set __call
 */
export const setSucceed = ROSet.fromArray

// /**
//  * @tsplus fluent global isNotNullish
//  */
// export const isNotNullish = isTruthy

// /**
//  * @tsplus getter global asOpt
//  */
// export function asOpt<A>(a: A | null | undefined): Opt<A> | undefined
// export function asOpt<A>(a: A | null): Opt<A>
// export function asOpt<A>(a: A | null | undefined) {
//   return a === undefined ? a : Opt.fromNullable(a)
// }

// /**
//  * @tsplus getter global asOpt2
//  */
// export const optionFromNullable = Opt.fromNullable
