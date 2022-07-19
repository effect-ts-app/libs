// ets_tracing: off

import * as E from "@effect-ts/core/Either"
import type * as O from "@effect-ts/core/Option"

export interface EitherOps<E, A> {
  /**
   * @ets_rewrite_method pipe from "smart:pipe"
   */
  pipe<Self, Ret>(this: Self, f: (self: Self) => Ret): Ret
import { unsafeGetLeft } from "@effect-ts/core/Either"

/**
 * @tsplus getter ets/Either left
 */
export const ext_unsafeGetLeft = unsafeGetLeft

import { unsafeGetRight } from "@effect-ts/core/Either"

/**
 * @tsplus getter ets/Either right
 */
export const ext_unsafeGetRight = unsafeGetRight

import { getLeft } from "@effect-ts/core/Either"

/**
 * @tsplus getter ets/Either getLeft
 */
export const ext_getLeft = getLeft

import { getRight } from "@effect-ts/core/Either"

/**
 * @tsplus getter ets/Either getRight
 */
export const ext_getRight = getRight

  /**
   * @ets_rewrite_method identity from "smart:identity"
   */
  widenLeft<WE>(): E.Either<WE | E, A>

  /**
   * @ets_rewrite_method identity from "smart:identity"
   */
  widenRight<WA>(): E.Either<E, WA | A>
import { chain_ } from "@effect-ts/core/Either"

/**
 * @tsplus fluent ets/Either chain
 */
export const ext_chain_ = chain_

import { map_ } from "@effect-ts/core/Either"

/**
 * @tsplus fluent ets/Either map
 */
export const ext_map_ = map_

import { isRight } from "@effect-ts/core/Either"

/**
 * @tsplus fluent ets/Either isRight
 */
export const ext_isRight = isRight

import { isLeft } from "@effect-ts/core/Either"

/**
 * @tsplus fluent ets/Either isLeft
 */
export const ext_isLeft = isLeft

declare module "@effect-ts/system/Either/core" {
  export interface Right<A> extends EitherOps<never, A> {}
  export interface Left<E> extends EitherOps<E, never> {}
}
