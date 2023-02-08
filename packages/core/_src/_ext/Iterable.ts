import * as T from "@effect/io/Effect"

/**
 * @tsplus fluent Array forEachPar
 * @tsplus fluent Array ReadonlyArray
 * @tsplus fluent Iterable forEachPar
 * @tsplus fluent effect/data/Chunk forEachPar
 * @tsplus fluent ets/Set forEachPar
 */
export const ext_forEachPar = T.forEachPar

// TODO:
/**
 * @tsplus fluent Array forEachEffect
 * @tsplus fluent ReadonlyArray forEachEffect
 * @tsplus fluent Iterable forEachEffect
 * @tsplus fluent effect/data/Chunk forEachEffect
 * @tsplus fluent ets/Set forEachEffect
 */
export const ext_forEach = T.forEach

/**
 * @tsplus fluent Array collectAll
 * @tsplus fluent effect/data/Chunk collectAll
 * @tsplus fluent ets/Set collectAll
 */
export const ext_collectAll = T.collectAll

/**
 * @tsplus fluent Array toChunk
 * @tsplus fluent ets/Set toChunk
 */
export const ext_from = Chunk.fromIterable
