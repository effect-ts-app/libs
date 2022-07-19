/* eslint-disable @typescript-eslint/no-empty-interface */
// ets_tracing: off
/* eslint-disable @typescript-eslint/no-unused-vars */
import type * as T from "@effect-ts/core/Effect"
import type { Cause } from "@effect-ts/core/Effect/Cause"
import type { Exit } from "@effect-ts/core/Effect/Exit"
import type { HasClock } from "@effect-ts/system/Clock"
import type { EffectOption } from "@effect-ts-app/core/EffectOption"

declare module "@effect-ts/monocle/Lens" {
  export interface Base<S, A> extends Lens<S, A> {}

  /**
   * @tsplus type ets/Lens
   */
  export interface Lens<S, A> {
import { modify_ } from "@effect-ts-app/fluent/_ext/Lens"

/**
 * @tsplus fluent ets/Lens modify
 */
export const ext_modify_ = modify_

import { prop_ } from "@effect-ts-app/fluent/_ext/Lens"

/**
 * @tsplus fluent ets/Lens prop
 */
export const ext_prop_ = prop_

declare module "@effect-ts/system/Has" {
  /**
   * @tsplus type ets/Has
   */
  export interface Has<T> {}

  /**
   * @tsplus type ets/Tag
   */
  export interface Tag<T> {}
}

declare module "@effect-ts/system/Effect/effect" {
  /**
   * @tsplus type ets/Effect
   */
  export interface Effect<R, E, A> {}
  export interface EffectStaticOps {
import { tryPromise } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops tryPromise
 */
export const ext_tryPromise = tryPromise

import { tryPromise } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops tryPromise
 */
export const ext_tryPromise = tryPromise

import { promise } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops promise
 */
export const ext_promise = promise

import { tryCatchPromise } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops tryCatchPromise
 */
export const ext_tryCatchPromise = tryCatchPromise

import { tuple } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops tuple
 */
export const ext_tuple = tuple

import { tuple } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops tuplePar
 */
export const ext_tuple = tuple

import { struct } from "@effect-ts/core/Effect"

/**
 * @tsplus static ets/Effect.Ops structPar
 */
export const ext_struct = struct

  interface EffectOps {
    // no tracing..
    // /**
    //  * @ets_rewrite_getter asUnit from "@effect-ts/core/Effect"
    //  */
    // readonly asUnit: Effect<R, E, void>
import { result } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect result
 */
export const ext_result = result

import { fold_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect fold
 */
export const ext_fold_ = fold_

import { delay_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect delay
 */
export const ext_delay_ = delay_

import { tapBoth_ } from "@effect-ts-app/core/Effect"

/**
 * @tsplus fluent ets/Effect tapBoth
 */
export const ext_tapBoth_ = tapBoth_

import { tapBothInclAbort_ } from "@effect-ts-app/core/Effect"

/**
 * @tsplus fluent ets/Effect tapBothInclAbort
 */
export const ext_tapBothInclAbort_ = tapBothInclAbort_

import { tapErrorInclAbort_ } from "@effect-ts-app/core/Effect"

/**
 * @tsplus fluent ets/Effect tapErrorInclAbort
 */
export const ext_tapErrorInclAbort_ = tapErrorInclAbort_

import { tapCause_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect tapCause
 */
export const ext_tapCause_ = tapCause_

import { catchAll_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect catchAll
 */
export const ext_catchAll_ = catchAll_

import { catch_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect catch
 */
export const ext_catch_ = catch_

import { catchTag_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect catchTag
 */
export const ext_catchTag_ = catchTag_

import { asUnit } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect asUnit
 */
export const ext_asUnit = asUnit

import { orDie } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect orDie
 */
export const ext_orDie = orDie

import { mapError_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect mapError
 */
export const ext_mapError_ = mapError_

    // TODO: consider different behavior of EffectOption (map maps over the value in Option), vs Effect (map maps over Option)
import { map_ } from "@effect-ts-app/core/EffectOption"

/**
 * @tsplus fluent ets/EffectOption mapOption
 */
export const ext_map_ = map_

import { flatMap_ } from "@effect-ts-app/core/EffectOption"

/**
 * @tsplus fluent ets/EffectOption flatMapOption
 */
export const ext_flatMap_ = flatMap_

import { flatMapEffect_ } from "@effect-ts-app/core/EffectOption"

/**
 * @tsplus fluent ets/EffectOption flatMapOptionEffect
 */
export const ext_flatMapEffect_ = flatMapEffect_

import { toNullable } from "@effect-ts-app/core/EffectOption"

/**
 * @tsplus fluent ets/EffectOption toNullable
 */
export const ext_toNullable = toNullable

import { alt_ } from "@effect-ts-app/core/EffectOption"

/**
 * @tsplus fluent ets/EffectOption alt
 */
export const ext_alt_ = alt_

import { getOrElse_ } from "@effect-ts-app/core/EffectOption"

/**
 * @tsplus fluent ets/EffectOption getOrElse
 */
export const ext_getOrElse_ = getOrElse_

import { getOrFail_ } from "@effect-ts-app/core/EffectOption"

/**
 * @tsplus fluent ets/EffectOption getOrFail
 */
export const ext_getOrFail_ = getOrFail_

// declare module "@effect-ts-app/core/EffectOption" {
//   export interface Base<R, E, A> extends EffectOption<R, E, A> {}

//   export interface EffectOption<R, E, A> {
//     //  /**
//     //  * @ets_rewrite_method map_ from "@effect-ts-app/core/EffectOption"
//     //  */
//     //  map<RX, EX, AX, B>(
//     //   this: EffectOption<RX, EX, AX>,
//     //   f: (a: AX) => B,
//     //   __trace?: string
//     // ): EffectOption<RX, EX, B>

//     // /**
//     //  * @ets_rewrite_method chain_ from "@effect-ts-app/core/EffectOption"
//     //  */
//     // chain<RX, EX, AX, R2, E2, B>(
//     //   this: EffectOption<RX, EX, AX>,
//     //   f: (a: AX) => EffectOption<R2, E2, B>,
//     //   __trace?: string
//     // ): EffectOption<RX & R2, EX | E2, B>

//     /**
//      * @ets_rewrite_method chainEffect_ from "@effect-ts-app/core/EffectOption"
//      */
//      chainEffect<RX, EX, AX, R2, E2, B>(
//       this: EffectOption<RX, EX, AX>,
//       f: (a: AX) => Effect<R2, E2, B>,
//       __trace?: string
//     ): EffectOption<RX & R2, EX | E2, B>
//   }
// }
