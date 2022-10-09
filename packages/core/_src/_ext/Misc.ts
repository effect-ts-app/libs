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
 * @tsplus operator ets/Array >=
 * @tsplus fluent ets/Array apply
 * @tsplus fluent ets/Array __call
 * @tsplus macro pipe
 */
export const pipeArray = pipe

/**
 * @tsplus static ets/NonEmptyArray __call
 */
export const naSucceed = NonEmptyArray.fromArray

/**
 * @tsplus static ets/Set __call
 */
export const setSucceed = ROSet.fromArray

/**
 * @tsplus operator ets/Schema/Schema >=
 * @tsplus fluent ets/Schema/Schema apply
 * @tsplus fluent ets/Schema/Schema __call
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
// export function asOpt<A>(a: A | null | undefined): Maybe<A> | undefined
// export function asOpt<A>(a: A | null): Maybe<A>
// export function asOpt<A>(a: A | null | undefined) {
//   return a === undefined ? a : Maybe.fromNullable(a)
// }

// /**
//  * @tsplus getter global asOpt2
//  */
// export const optionFromNullable = Maybe.fromNullable
