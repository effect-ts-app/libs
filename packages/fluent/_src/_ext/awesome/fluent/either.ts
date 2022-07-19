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

  /**
   * @ets_rewrite_method chain_ from "@effect-ts/core/Either"
   */
  chain<EX, AX, E2, B>(
    this: E.Either<EX, AX>,
    f: (a: AX) => E.Either<E2, B>
  ): E.Either<EX | E2, B>

  /**
   * @ets_rewrite_method map_ from "@effect-ts/core/Either"
   */
  map<EX, AX, B>(this: E.Either<EX, AX>, f: (a: AX) => B): E.Either<EX, B>

  /**
   * @ets_rewrite_method isRight from "@effect-ts/core/Either"
   */
  isRight<EX, AX>(this: E.Either<EX, AX>): this is E.Right<AX>

  /**
   * @ets_rewrite_method isLeft from "@effect-ts/core/Either"
   */
  isLeft<EX, AX>(this: E.Either<EX, AX>): this is E.Left<EX>
}

declare module "@effect-ts/system/Either/core" {
  export interface Right<A> extends EitherOps<never, A> {}
  export interface Left<E> extends EitherOps<E, never> {}
}
