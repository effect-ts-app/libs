/**
 * @tsplus pipeable Array forEachPar
 * @tsplus pipeable Chunk forEachPar
 * @tsplus pipeable ets/Set forEachPar
 */
export const ext_forEachPar = Effect.forEachPar

/**
 * @tsplus fluent Array forEachEffect
 * @tsplus fluent Chunk forEachEffect
 * @tsplus fluent Chunk forEachEffect
 * @tsplus fluent ets/Set forEachEffect
 */
export function ext_forEach<A, R, E, B>(
  as: Iterable<A>,
  f: (a: A) => Effect<R, E, B>
) {
  return Effect.forEach(f)(Chunk.fromIterable(as))
}

/**
 * @tsplus fluent Array collectAll
 * @tsplus fluent Chunk collectAll
 * @tsplus fluent ets/Set collectAll
 */
export function ext_collectAll<A, R, E>(as: Iterable<Effect<R, E, A>>) {
  return Effect.collectAll(Chunk.fromIterable(as))
}

// /**
//  * @tsplus fluent Array forEachSync
//  * @tsplus fluent Chunk forEachSync
//  * @tsplus fluent ets/Set forEachSync
//  */
// export const ext_forEachSync_ = forEachSync_

// /**
//  * @tsplus fluent Array collectAllSync
//  * @tsplus fluent Chunk collectAllSync
//  * @tsplus fluent ets/Set collectAllSync
//  */
// export const ext_collectAllSync = collectAllSync

/**
 * @tsplus fluent Array toChunk
 * @tsplus fluent ets/Set toChunk
 */
export const ext_from = Chunk.fromIterable
