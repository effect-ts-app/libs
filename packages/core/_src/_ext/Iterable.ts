import * as T from "@effect/io/Effect"

/**
 * @tsplus fluent Array forEachPar
 * @tsplus fluent Array ReadonlyArray
 * @tsplus fluent Iterable forEachPar
 * @tsplus fluent fp-ts/data/Chunk forEachPar
 * @tsplus fluent ets/Set forEachPar
 */
export const ext_forEachPar = T.forEachPar

/**
 * @tsplus fluent Array forEachEffect
 * @tsplus fluent ReadonlyArray forEachEffect
 * @tsplus fluent Iterable forEachEffect
 * @tsplus fluent fp-ts/data/Chunk forEachEffect
 * @tsplus fluent ets/Set forEachEffect
 */
export function ext_forEach<A, R, E, B>(
  as: Iterable<A>,
  f: (a: A) => Effect<R, E, B>
) {
  return T.forEach(Chunk.fromIterable(as), f)
}

/**
 * @tsplus fluent Array collectAll
 * @tsplus fluent fp-ts/data/Chunk collectAll
 * @tsplus fluent ets/Set collectAll
 */
export function ext_collectAll<A, R, E>(as: Iterable<Effect<R, E, A>>) {
  return Effect.collectAll(Chunk.fromIterable(as))
}

// /**
//  * @tsplus fluent Array forEachSync
//  * @tsplus fluent fp-ts/data/Chunk forEachSync
//  * @tsplus fluent ets/Set forEachSync
//  */
// export const ext_forEachSync_ = forEachSync_

// /**
//  * @tsplus fluent Array collectAllSync
//  * @tsplus fluent fp-ts/data/Chunk collectAllSync
//  * @tsplus fluent ets/Set collectAllSync
//  */
// export const ext_collectAllSync = collectAllSync

/**
 * @tsplus fluent Array toChunk
 * @tsplus fluent ets/Set toChunk
 */
export const ext_from = Chunk.fromIterable
