import { Some } from "../Maybe.js"
import { pipe } from "./pipe.js"

/**
 * @tsplus unify ets/Maybe
 * @tsplus unify ets/Maybe/Some
 * @tsplus unify ets/Maybe/None
 */
export function unifyMaybe<X extends Maybe<any>>(
  self: X
): Maybe<X extends Some<infer A> ? A : never> {
  return self
}

/**
 * @tsplus fluent ets/Maybe flatMap
 */
export const flatMapMaybe = Maybe.chain_

/**
 * @tsplus fluent ets/Maybe map
 */
export const mapMaybe = Maybe.map_

/**
 * @tsplus fluent ets/Maybe encaseInEither
 */
export const optionEncaseEither = Either.fromOption_

/**
 * @tsplus static ets/Maybe __call
 */
export const optionSome = Maybe.some

/**
 * @tsplus operator ets/Maybe >=
 * @tsplus fluent ets/Maybe apply
 * @tsplus fluent ets/Maybe __call
 * @tsplus macro pipe
 */
export const pipeMaybe = pipe
