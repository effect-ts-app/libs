import * as T from "effect/Effect"

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

/**
 * @tsplus getter Generator toArray
 * @tsplus getter Iterable toArray
 */
export function toArray<A>(
  gen: Generator<A, void, unknown>
) {
  return Array.from(gen)
}

/**
 * @tsplus getter Iterable toArray
 * @tsplus getter Iterator toArray
 * @tsplus getter Generator toArray
 */
export const iterableToArray = Array.from

/**
 * @tsplus getter Iterable toNonEmptyArray
 */
export function CollectionToNonEmptyReadonlyArray<A>(c: Iterable<A>) {
  return iterableToArray(c).toNonEmpty
}
