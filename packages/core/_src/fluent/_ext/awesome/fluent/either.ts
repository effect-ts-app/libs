// ets_tracing: off

import {
  chain_,
  getLeft,
  getRight,
  isLeft,
  isRight,
  map_,
} from "@effect-ts/core/Either"

/**
 * @tsplus getter ets/Either left
 */
export const ext_left = <E>(self: Either.Left<E>): E => self.left

/**
 * @tsplus getter ets/Either right
 */
export const ext_right = <A>(self: Either.Right<A>): A => self.right

/**
 * @tsplus getter ets/Either getLeft
 */
export const ext_getLeft = getLeft

/**
 * @tsplus getter ets/Either getRight
 */
export const ext_getRight = getRight

/**
 * @tsplus fluent ets/Either flatMap
 */
export const ext_chain_ = chain_

/**
 * @tsplus fluent ets/Either map
 */
export const ext_map_ = map_

/**
 * @tsplus fluent ets/Either isRight
 */
export const ext_isRight = isRight

/**
 * @tsplus fluent ets/Either isLeft
 */
export const ext_isLeft = isLeft
