// ets_tracing: off

import * as E from "@effect-ts/core/Either"
import type * as O from "@effect-ts/core/Option"

export interface EitherOps<E, A> {
  /**
   * @ets_rewrite_method pipe from "smart:pipe"
   */
  pipe<Self, Ret>(this: Self, f: (self: Self) => Ret): Ret

  /**
   * @ets_rewrite_getter unsafeGetLeft from "@effect-ts/core/Either"
   */
  readonly left: E | undefined

  /**
   * @ets_rewrite_getter unsafeGetRight from "@effect-ts/core/Either"
   */
  readonly right: A | undefined

  /**
   * @ets_rewrite_getter getLeft from "@effect-ts/core/Either"
   */
  readonly getLeft: O.Option<E>

  /**
   * @ets_rewrite_getter getRight from "@effect-ts/core/Either"
   */
  readonly getRight: O.Option<A>

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
