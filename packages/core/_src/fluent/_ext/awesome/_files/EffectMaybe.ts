/* eslint-disable @typescript-eslint/no-empty-interface */
// ets_tracing: off
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  asUnit,
  catch_,
  catchAll_,
  catchTag_,
  delay_,
  fold_,
  mapError_,
  orDie,
  promise,
  result,
  struct,
  tapCause_,
  tryCatchPromise,
  tryPromise,
  tuple,
} from "@effect-ts/core/Effect"
import {
  tapBoth_,
  tapBothInclAbort_,
  tapErrorInclAbort_,
} from "@effect-ts-app/core/Effect"
import {
  alt_,
  flatMap_,
  flatMapEffect_,
  getOrElse_,
  getOrFail_,
  map_,
  toNullable,
} from "@effect-ts-app/core/EffectMaybe"
import { modify_, prop_ } from "@effect-ts-app/core/fluent/_ext/Lens"

/**
 * @tsplus fluent ets/Lens modify
 */
export const ext_modify_ = modify_

/**
 * @tsplus fluent ets/Lens prop
 */
export const ext_prop_ = prop_

/**
 * @tsplus static ets/Effect.Ops tryPromise
 */
export const ext_tryPromise = tryPromise

// /**
//  * @tsplus static ets/Effect.Ops tryPromise
//  */
// export const ext_tryPromise = tryPromise

/**
 * @tsplus static ets/Effect.Ops promise
 */
export const ext_promise = promise

/**
 * @tsplus static ets/Effect.Ops tryCatchPromise
 */
export const ext_tryCatchPromise = tryCatchPromise

// /**
//  * @tsplus static ets/Effect.Ops tuple
//  */
// export const ext_tuple = tuple

/**
 * @tsplus static ets/Effect.Ops tuplePar
 */
export const ext_tuple = tuple

/**
 * @tsplus static ets/Effect.Ops structPar
 */
export const ext_struct = struct

/**
 * @tsplus getter ets/Effect asUnit
 */
export const ext_asUnit = asUnit

/**
 * @tsplus getter ets/Effect result
 */
export const ext_result = <R, E, A>(value: Effect<R, E, A>) => result(value)

/**
 * @tsplus fluent ets/Effect fold
 */
export const ext_fold_ = fold_

/**
 * @tsplus fluent ets/Effect delay
 */
export const ext_delay_ = delay_

/**
 * @tsplus fluent ets/Effect tapBoth
 */
export const ext_tapBoth_ = tapBoth_

/**
 * @tsplus fluent ets/Effect tapBothInclAbort
 */
export const ext_tapBothInclAbort_ = tapBothInclAbort_

/**
 * @tsplus fluent ets/Effect tapErrorInclAbort
 */
export const ext_tapErrorInclAbort_ = tapErrorInclAbort_

/**
 * @tsplus fluent ets/Effect tapCause
 */
export const ext_tapCause_ = tapCause_

/**
 * @tsplus fluent ets/Effect catchAll
 */
export const ext_catchAll_ = catchAll_

/**
 * @tsplus fluent ets/Effect catch
 */
export const ext_catch_ = catch_

/**
 * @tsplus fluent ets/Effect catchTag
 */
export const ext_catchTag_ = catchTag_

// /**
//  * @tsplus fluent ets/Effect asUnit
//  */
// export const ext_asUnit = asUnit

/**
 * @tsplus fluent ets/Effect orDie
 */
export const ext_orDie = orDie

/**
 * @tsplus fluent ets/Effect mapError
 */
export const ext_mapError_ = mapError_

/**
 * @tsplus fluent ets/Effect mapMaybe
 */
export const ext_map_ = map_

/**
 * @tsplus fluent ets/Effect flatMapMaybe
 */
export const ext_flatMap_ = flatMap_

/**
 * @tsplus fluent ets/Effect flatMapMaybeEffect
 */
export const ext_flatMapEffect_ = flatMapEffect_

/**
 * @tsplus fluent ets/Effect toNullable
 */
export const ext_toNullable = toNullable

/**
 * @tsplus fluent ets/Effect alt
 */
export const ext_alt_ = alt_

/**
 * @tsplus fluent ets/Effect getOrElse
 */
export const ext_getOrElse_ = getOrElse_

/**
 * @tsplus fluent ets/Effect getOrFail
 */
export const ext_getOrFail_ = getOrFail_

// declare module "@effect-ts-app/core/EffectMaybe" {
//   export interface Base<R, E, A> extends EffectMaybe<R, E, A> {}

//   export interface EffectMaybe<R, E, A> {
//     //  /**
//     //  * @ets_rewrite_method map_ from "@effect-ts-app/core/EffectMaybe"
//     //  */
//     //  map<RX, EX, AX, B>(
//     //   this: EffectMaybe<RX, EX, AX>,
//     //   f: (a: AX) => B,
//     //   __trace?: string
//     // ): EffectMaybe<RX, EX, B>

//     // /**
//     //  * @ets_rewrite_method chain_ from "@effect-ts-app/core/EffectMaybe"
//     //  */
//     // chain<RX, EX, AX, R2, E2, B>(
//     //   this: EffectMaybe<RX, EX, AX>,
//     //   f: (a: AX) => EffectMaybe<R2, E2, B>,
//     //   __trace?: string
//     // ): EffectMaybe<RX | R2, EX | E2, B>

//     /**
//      * @ets_rewrite_method chainEffect_ from "@effect-ts-app/core/EffectMaybe"
//      */
//      chainEffect<RX, EX, AX, R2, E2, B>(
//       this: EffectMaybe<RX, EX, AX>,
//       f: (a: AX) => Effect<R2, E2, B>,
//       __trace?: string
//     ): EffectMaybe<RX | R2, EX | E2, B>
//   }
// }
