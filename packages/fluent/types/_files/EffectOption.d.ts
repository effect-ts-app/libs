// ets_tracing: off
/* eslint-disable import/no-duplicates */
/* eslint-disable unused-imports/no-unused-imports */
import type { NonEmptyArray } from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import type * as NA from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import { Cause } from "@effect-ts/core/Effect/Cause"
import * as Ex from "@effect-ts/core/Effect/Exit"
import type * as O from "@effect-ts/core/Option"
import type { Option } from "@effect-ts/core/Option"
import * as Ord from "@effect-ts/core/Ord"
import type * as LENS from "@effect-ts/monocle/Lens"
import type { HasClock } from "@effect-ts/system/Clock"
import type * as T from "@effect-ts-app/core/Effect"
import type { Effect } from "@effect-ts-app/core/Effect"
import type { EffectOption } from "@effect-ts-app/core/EffectOption"
import type * as EO from "@effect-ts-app/core/EffectOption"

declare module "@effect-ts/monocle/Lens" {
  export interface Base<S, A> extends Lens<S, A> {}

  export interface Lens<S, A> {
    /**
     * @ets_rewrite_method modify_ from "@effect-ts-app/fluent/_ext/Lens"
     */
    modify<S, A>(this: Lens<S, A>, f: (a: A) => A): (s: S) => S

    /**
     * @ets_rewrite_method prop_ from "@effect-ts-app/fluent/_ext/Lens"
     */
    prop<S, A, P extends keyof A>(this: Lens<S, A>, prop: P): Lens<S, A[P]>
  }
}

declare module "@effect-ts/system/Effect/effect" {
  export interface Base<R, E, A> extends Effect<R, E, A> {}

  export interface Effect<R, E, A> {
    // no tracing..
    // /**
    //  * @ets_rewrite_getter asUnit from "@effect-ts/core/Effect"
    //  */
    // readonly asUnit: Effect<R, E, void>

    /**
     * @ets_rewrite_method result from "@effect-ts/core/Effect"
     */
    result<R, E, A>(
      this: Effect<R, E, A>,
      __trace?: string
    ): Effect<R, never, Ex.Exit<E, A>>

    /**
     * @ets_rewrite_method fold_ from "@effect-ts/core/Effect"
     */
    fold<R, E, A, A2, A3>(
      this: Effect<R, E, A>,
      failure: (failure: E) => A2,
      success: (a: A) => A3,
      __trace?: string
    ): Effect<R, never, A2 | A3>

    /**
     * @ets_rewrite_method delay_ from "@effect-ts/core/Effect"
     */
    delay<R, E, A>(
      this: Effect<R, E, A>,
      ms: number,
      __trace?: string
    ): Effect<R & HasClock, E, A>

    /**
     * @ets_rewrite_method tapBoth_ from "@effect-ts-app/core/Effect"
     */
    tapBoth<R, E, A, R2, R3, E3>(
      this: Effect<R, E, A>,
      f: (e: E) => Effect<R2, never, any>,
      g: (a: A) => Effect<R3, E3, any>
    ): Effect<R3 & R & R2, E | E3, A>

    /**
     * @ets_rewrite_method tapBothInclAbort_ from "@effect-ts-app/core/Effect"
     */
    tapBothInclAbort<R, E, A, ER, EE, EA, SR, SE, SA>(
      this: Effect<R, E, A>,
      onError: (err: unknown) => Effect<ER, EE, EA>,
      onSuccess: (a: A) => Effect<SR, SE, SA>
    ): Effect<R & ER & SR, E | EE | SE, A>

    /**
     * @ets_rewrite_method tapErrorInclAbort_ from "@effect-ts-app/core/Effect"
     */
    tapErrorInclAbort<R, E, A, ER, EE, EA>(
      this: Effect<R, E, A>,
      onError: (err: unknown) => Effect<ER, EE, EA>
    ): Effect<R & ER, E | EE, A>

    /**
     * @ets_rewrite_method tapCause_ from "@effect-ts/core/Effect"
     */
    tapCause<R2, A2, R, E, E2, X>(
      this: Effect<R2, E2, A2>,
      f: (e: Cause<E2>) => Effect<R, E, X>,
      __trace?: string
    ): Effect<R2 & R, E | E2, A2>

    /**
     * @ets_rewrite_method catchAll_ from "@effect-ts/core/Effect"
     */
    catchAll<R2, E2, A2, R, E, A>(
      this: Effect<R2, E2, A2>,
      f: (e: E2) => Effect<R, E, A>,
      __trace?: string
    ): Effect<R2 & R, E, A2 | A>

    /**
     * @ets_rewrite_method catch_ from "@effect-ts/core/Effect"
     */
    catch<N extends keyof E, K extends E[N] & string, E, R, A, R1, E1, A1>(
      self: Effect<R, E, A>,
      tag: N,
      k: K,
      f: (
        e: Extract<
          E,
          {
            [n in N]: K
          }
        >
      ) => Effect<R1, E1, A1>,
      __trace?: string
    ): Effect<
      R & R1,
      | Exclude<
          E,
          {
            [n in N]: K
          }
        >
      | E1,
      A | A1
    >

    /**
     * @ets_rewrite_method catchTag_ from "@effect-ts/core/Effect"
     */
    catchTag<
      K extends E["_tag"] & string,
      E extends {
        _tag: string
      },
      R,
      A,
      R1,
      E1,
      A1
    >(
      this: Effect<R, E, A>,
      k: K,
      f: (
        e: Extract<
          E,
          {
            _tag: K
          }
        >
      ) => Effect<R1, E1, A1>,
      __trace?: string
    ): Effect<
      R & R1,
      | Exclude<
          E,
          {
            _tag: K
          }
        >
      | E1,
      A | A1
    >

    /**
     * @ets_rewrite_method asUnit from "@effect-ts/core/Effect"
     */
    asUnit<R, E, A>(this: Effect<R, E, A>, __trace?: string): Effect<R, E, void>

    /**
     * @ets_rewrite_method orDie from "@effect-ts/core/Effect"
     */
    orDie<R, E, A>(this: Effect<R, E, A>, __trace?: string): Effect<R, never, A>

    /**
     * @ets_rewrite_method mapError_ from "@effect-ts/core/Effect"
     */
    mapError<R, E, E2, A>(
      this: Effect<R, E, A>,
      f: (e: E) => E2,
      __trace?: string
    ): Effect<R, E2, A>

    // TODO: consider different behavior of EffectOption (map maps over the value in Option), vs Effect (map maps over Option)

    /**
     * @ets_rewrite_method map_ from "@effect-ts-app/core/EffectOption"
     */
    mapOption<RX, EX, AX, B>(
      this: EO.EffectOption<RX, EX, AX>,
      f: (a: AX) => B,
      __trace?: string
    ): EO.EffectOption<RX, EX, B>

    /**
     * @ets_rewrite_method chain_ from "@effect-ts-app/core/EffectOption"
     */
    chainOption<RX, EX, AX, R2, E2, B>(
      this: EO.EffectOption<RX, EX, AX>,
      f: (a: AX) => EO.EffectOption<R2, E2, B>,
      __trace?: string
    ): EO.EffectOption<RX & R2, EX | E2, B>

    /**
     * @ets_rewrite_method chainEffect_ from "@effect-ts-app/core/EffectOption"
     */
    chainOptionEffect<RX, EX, AX, R2, E2, B>(
      this: EO.EffectOption<RX, EX, AX>,
      f: (a: AX) => Effect<R2, E2, B>,
      __trace?: string
    ): EO.EffectOption<RX & R2, EX | E2, B>

    /**
     * @ets_rewrite_method toNullable from "@effect-ts-app/core/EffectOption"
     */
    toNullable<R, E, A>(this: EO.EffectOption<R, E, A>): Effect<R, E, A | null>
  }
}

// declare module "@effect-ts-app/core/EffectOption" {
//   export interface Base<R, E, A> extends EffectOption<R, E, A> {}

//   export interface EffectOption<R, E, A> {
//     //  /**
//     //  * @ets_rewrite_method map_ from "@effect-ts-app/core/EffectOption"
//     //  */
//     //  map<RX, EX, AX, B>(
//     //   this: EO.EffectOption<RX, EX, AX>,
//     //   f: (a: AX) => B,
//     //   __trace?: string
//     // ): EO.EffectOption<RX, EX, B>

//     // /**
//     //  * @ets_rewrite_method chain_ from "@effect-ts-app/core/EffectOption"
//     //  */
//     // chain<RX, EX, AX, R2, E2, B>(
//     //   this: EO.EffectOption<RX, EX, AX>,
//     //   f: (a: AX) => EO.EffectOption<R2, E2, B>,
//     //   __trace?: string
//     // ): EO.EffectOption<RX & R2, EX | E2, B>

//     /**
//      * @ets_rewrite_method chainEffect_ from "@effect-ts-app/core/EffectOption"
//      */
//      chainEffect<RX, EX, AX, R2, E2, B>(
//       this: EO.EffectOption<RX, EX, AX>,
//       f: (a: AX) => Effect<R2, E2, B>,
//       __trace?: string
//     ): EO.EffectOption<RX & R2, EX | E2, B>
//   }
// }
