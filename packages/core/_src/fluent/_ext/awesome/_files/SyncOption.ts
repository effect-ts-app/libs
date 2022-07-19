import {
  alt_,
  flatMap_,
  flatMapSync_,
  getOrElse_,
  getOrFail_,
  map_,
  toNullable,
} from "@effect-ts-app/core/SyncOption"

/**
 * @tsplus fluent ets/Sync mapOption
 */
export const ext_map_ = map_

/**
 * @tsplus fluent ets/Sync flatMapOption
 */
export const ext_flatMap_ = flatMap_

/**
 * @tsplus fluent ets/Sync flatMapOptionSync
 */
export const ext_flatMapSync_ = flatMapSync_

/**
 * @tsplus fluent ets/Sync toNullable
 */
export const ext_toNullable = toNullable

/**
 * @tsplus fluent ets/Sync alt
 */
export const ext_alt_ = alt_

/**
 * @tsplus fluent ets/Sync getOrElse
 */
export const ext_getOrElse_ = getOrElse_

/**
 * @tsplus fluent ets/Sync getOrFail
 */
export const ext_getOrFail_ = getOrFail_
