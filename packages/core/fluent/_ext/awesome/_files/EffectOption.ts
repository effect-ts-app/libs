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
} from "@effect-ts-app/core/EffectOption"
import { modify_, prop_ } from "@effect-ts-app/fluent/_ext/Lens"

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
 * @tsplus fluent ets/Effect result
 */
export const ext_result = result

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
 * @tsplus fluent ets/Effect mapOption
 */
export const ext_map_ = map_

/**
 * @tsplus fluent ets/Effect flatMapOption
 */
export const ext_flatMap_ = flatMap_

/**
 * @tsplus fluent ets/Effect flatMapOptionEffect
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
