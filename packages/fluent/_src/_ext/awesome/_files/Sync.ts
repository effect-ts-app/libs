import { chain_, map_, mapError_ } from "@effect-ts/core/Sync"
import { orDie, toEffect } from "@effect-ts-app/core/Sync"
import {
  alt_,
  flatMap_,
  flatMapSync_,
  getOrElse_,
  getOrFail_,
  map_,
  toNullable,
} from "@effect-ts-app/core/SyncOption"

// // Undo the selection for Effect for now.
// chain<RX, EX, AX, R2, E2, B>(
//   this: Sync<RX, EX, AX>,
//   f: (a: AX) => Effect<R2, E2, B>
// ): ["Not supported currently, use toEffect and chain", never]

/**
 * @tsplus fluent ets/Sync toEffect
 */
export const ext_toEffect = toEffect

/**
 * @tsplus fluent ets/Sync orDie
 */
export const ext_orDie = orDie

/**
 * @tsplus fluent ets/Sync chain
 */
export const ext_chain_ = chain_

/**
 * @tsplus fluent ets/Sync map
 */
export const ext_map_ = map_

/**
 * @tsplus fluent ets/Sync mapError
 */
export const ext_mapError_ = mapError_

/**
 * @tsplus fluent ets/SyncOption mapOption
 */
export const ext_map_ = map_

/**
 * @tsplus fluent ets/SyncOption flatMapOption
 */
export const ext_flatMap_ = flatMap_

/**
 * @tsplus fluent ets/SyncOption flatMapOptionSync
 */
export const ext_flatMapSync_ = flatMapSync_

/**
 * @tsplus fluent ets/SyncOption toNullable
 */
export const ext_toNullable = toNullable

/**
 * @tsplus fluent ets/SyncOption alt
 */
export const ext_alt_ = alt_

/**
 * @tsplus fluent ets/SyncOption getOrElse
 */
export const ext_getOrElse_ = getOrElse_

/**
 * @tsplus fluent ets/SyncOption getOrFail
 */
export const ext_getOrFail_ = getOrFail_
