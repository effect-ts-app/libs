// ets_tracing: off

/* eslint-disable @typescript-eslint/no-namespace */
import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"
import type * as E from "@effect-ts/core/Either"
import type { Predicate, Refinement } from "@effect-ts/core/Function"
import type * as O from "@effect-ts/core/Option"
import type { Separated } from "@effect-ts/core/Utils"

declare module "@effect-ts/system/Option/core" {
  export interface OptionOps<A> {
    /**
     * @ets_rewrite_method pipe from "smart:pipe"
     */
    pipe<Self, Ret>(this: Self, f: (self: Self) => Ret): Ret

    /**
     * @ets_rewrite_method ap_ from "@effect-ts/core/Option"
     */
    ap<AX, B>(this: O.Option<(a: AX) => B>, fa: O.Option<AX>): O.Option<B>

    /**
     * @ets_rewrite_method chain_ from "@effect-ts/core/Option"
     */
    chain<AX, B>(this: O.Option<AX>, f: (a: AX) => O.Option<B>): O.Option<B>

    /**
     * @ets_rewrite_method duplicate from "@effect-ts/core/Option"
     */
    duplicate<AX>(this: O.Option<AX>): O.Option<O.Option<AX>>

    /**
     * @ets_rewrite_method exists_ from "@effect-ts/core/Option"
     */
    exists<AX>(this: O.Option<AX>, predicate: Predicate<AX>): boolean

    /**
     * @ets_rewrite_method extend_ from "@effect-ts/core/Option"
     */
    extend<AX, B>(this: O.Option<AX>, f: (a: O.Option<AX>) => B): O.Option<B>

    /**
     * @ets_rewrite_method flatten from "@effect-ts/core/Option"
     */
    flatten<AX>(this: O.Option<O.Option<AX>>): O.Option<AX>

    /**
     * @ets_rewrite_method filter_ from "@effect-ts/core/Option"
     */
    filter<AX, BX extends AX>(
      this: O.Option<AX>,
      refinement: Refinement<AX, BX>
    ): O.Option<BX>

    /**
     * @ets_rewrite_method filter_ from "@effect-ts/core/Option"
     */
    filter<AX>(this: O.Option<AX>, refinement: Predicate<AX>): O.Option<AX>

    /**
     * @ets_rewrite_method filterMap_ from "@effect-ts/core/Option"
     */
    filter<AX, BX>(
      this: O.Option<AX>,
      refinement: (a: AX) => O.Option<BX>
    ): O.Option<BX>

    /**
     * @ets_rewrite_method fold_ from "@effect-ts/core/Option"
     */
    fold<AX, B, C>(this: O.Option<AX>, onNone: () => B, onSome: (a: AX) => C): B | C

    /**
     * @ets_rewrite_method getOrElse_ from "@effect-ts/core/Option"
     */
    getOrElse<AX, B>(this: O.Option<AX>, f: () => B): AX | B

    /**
     * @ets_rewrite_method isSome from "@effect-ts/core/Option"
     */
    isSome<AX>(this: O.Option<AX>): this is O.Some<AX>

    /**
     * @ets_rewrite_method isNone from "@effect-ts/core/Option"
     */
    isNone<AX>(this: O.Option<AX>): this is O.None

    /**
     * @ets_rewrite_method map_ from "@effect-ts/core/Option"
     */
    map<AX, B>(this: O.Option<AX>, f: (a: AX) => B): O.Option<B>

    /**
     * @ets_rewrite_method partitionMap_ from "@effect-ts/core/Option"
     */
    partition<AX, B, C>(
      this: O.Option<AX>,
      f: (a: AX) => E.Either<B, C>
    ): Separated<O.Option<B>, O.Option<C>>

    /**
     * @ets_rewrite_method partition_ from "@effect-ts/core/Option"
     */
    partition<AX, B extends AX>(
      this: O.Option<AX>,
      ref: Refinement<AX, B>
    ): Separated<O.Option<Exclude<AX, B>>, O.Option<B>>

    /**
     * @ets_rewrite_method partition_ from "@effect-ts/core/Option"
     */
    partition<AX>(
      this: O.Option<AX>,
      ref: Predicate<AX>
    ): Separated<O.Option<AX>, O.Option<AX>>

    /**
     * @ets_rewrite_method separate from "@effect-ts/core/Option"
     */
    separate<AX, BX>(
      this: O.Option<E.Either<AX, BX>>
    ): Separated<O.Option<AX>, O.Option<BX>>

    /**
     * @ets_rewrite_method tap_ from "@effect-ts/core/Option"
     */
    tap<AX, B>(this: O.Option<AX>, f: (a: AX) => O.Option<B>): O.Option<AX>

    /**
     * @ets_rewrite_method toUndefined from "@effect-ts/core/Option"
     */
    toUndefined<A>(this: O.Option<A>): A | undefined

    /**
     * @ets_rewrite_method zip_ from "@effect-ts/core/Option"
     */
    zip<AX, B>(this: O.Option<AX>, fa: O.Option<B>): O.Option<Tuple<[AX, B]>>

    /**
     * @ets_rewrite_method zipFirst_ from "@effect-ts/core/Option"
     */
    zipLeft<AX, B>(this: O.Option<AX>, fa: O.Option<B>): O.Option<AX>

    /**
     * @ets_rewrite_method zipSecond_ from "@effect-ts/core/Option"
     */
    zipRight<AX, B>(this: O.Option<AX>, fa: O.Option<B>): O.Option<B>

    /**
     * @ets_rewrite_getter toUndefined from "@effect-ts/core/Option"
     */
    get value(): A | undefined
  }

  export interface Some<A> extends OptionOps<A> {}
  export interface None extends OptionOps<never> {}

  export interface OptionStaticOps {
    /**
     * @ets_rewrite_static some from "@effect-ts/core/Option"
     */
    some: typeof O.some

    /**
     * @ets_rewrite_static none from "@effect-ts/core/Option"
     */
    none: typeof O.none

    /**
     * @ets_rewrite_static Applicative from "@effect-ts/core/Option"
     */
    Applicative: typeof O.Applicative
  }

  export const Option: OptionStaticOps
}
