import { chain_, map_, mapError_ } from "@effect-ts/core/Sync"
import { orDie, toEffect } from "@effect-ts-app/core/Sync"

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
 * @tsplus fluent ets/Sync flatMap
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
