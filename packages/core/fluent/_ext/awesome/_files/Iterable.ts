import { from } from "@effect-ts-app/core/Chunk"
import {
  collectAll,
  forEach_,
  forEachPar_,
  forEachParN_,
} from "@effect-ts-app/core/Effect"
import {
  collectAll as collectAllSync,
  forEach_ as forEachSync_,
} from "@effect-ts-app/core/Sync"

/**
 * @tsplus fluent ets/Array forEachParN
 * @tsplus fluent ets/Chunk forEachParN
 * @tsplus fluent ets/Set forEachParN
 */
export const ext_forEachParN_ = forEachParN_

/**
 * @tsplus fluent ets/Array forEachPar
 * @tsplus fluent ets/Chunk forEachPar
 * @tsplus fluent ets/Set forEachPar
 */
export const ext_forEachPar_ = forEachPar_

/**
 * @tsplus fluent ets/Array forEachEffect
 * @tsplus fluent ets/Chunk forEachEffect
 * @tsplus fluent ets/Set forEachEffect
 */
export const ext_forEach_ = forEach_

/**
 * @tsplus fluent ets/Array collectAll
 * @tsplus fluent ets/Chunk collectAll
 * @tsplus fluent ets/Set collectAll
 */
export const ext_collectAll = collectAll

/**
 * @tsplus fluent ets/Array forEachSync
 * @tsplus fluent ets/Chunk forEachSync
 * @tsplus fluent ets/Set forEachSync
 */
export const ext_forEachSync_ = forEachSync_

/**
 * @tsplus fluent ets/Array collectAllSync
 * @tsplus fluent ets/Chunk collectAllSync
 * @tsplus fluent ets/Set collectAllSync
 */
export const ext_collectAllSync = collectAllSync

/**
 * @tsplus fluent ets/Array toChunk
 * @tsplus fluent ets/Set toChunk
 */
export const ext_from = from
