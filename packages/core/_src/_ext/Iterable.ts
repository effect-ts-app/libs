import * as T from "@effect/io/Effect"

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
 * @tsplus fluent Array toChunk
 * @tsplus fluent ets/Set toChunk
 */
export const ext_from = Chunk.fromIterable
