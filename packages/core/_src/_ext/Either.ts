import { Left, Right } from "../Either.js"
import { pipe } from "./pipe.js"

/**
 * @tsplus unify ets/Either
 * @tsplus unify ets/Either/Left
 * @tsplus unify ets/Either/Right
 */
export function unifyEither<X extends Either<any, any>>(
  self: X
): Either<
  X extends Left<infer EX> ? EX : never,
  X extends Right<infer AX> ? AX : never
> {
  return self
}

/**
 * @tsplus fluent ets/Either flatMap
 */
export const flatMapEither = Either.chain_

/**
 * @tsplus fluent ets/Either map
 */
export const mapEither = Either.map_

/**
 * @tsplus fluent ets/Either mapLeft
 */
export const eitherMapLeft = Either.mapLeft_

/**
 * @tsplus static ets/Either __call
 */
export const eitherRight = Either.right

/**
 * @tsplus operator ets/Either >=
 * @tsplus fluent ets/Either apply
 * @tsplus fluent ets/Either __call
 * @tsplus macro pipe
 */
export const pipeEither = pipe
