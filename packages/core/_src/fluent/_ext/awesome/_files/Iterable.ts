/**
 * @tsplus fluent ets/Array forEachPar
 * @tsplus fluent Chunk forEachPar
 * @tsplus fluent ets/Set forEachPar
 */
export function ext_forEachPar<A, R, E, B>(
  as: Iterable<A>,
  f: (a: A) => Effect<R, E, B>
) {
  return Effect.forEachPar(Chunk.from(as), f)
}

/**
 * @tsplus fluent ets/Array forEachEffect
 * @tsplus fluent Chunk forEachEffect
 * @tsplus fluent Chunk forEachEffect
 * @tsplus fluent ets/Set forEachEffect
 */
export function ext_forEach<A, R, E, B>(as: Iterable<A>, f: (a: A) => Effect<R, E, B>) {
  return Effect.forEach(Chunk.from(as), f)
}

/**
 * @tsplus fluent ets/Array collectAll
 * @tsplus fluent Chunk collectAll
 * @tsplus fluent ets/Set collectAll
 */
export function ext_collectAll<A, R, E>(as: Iterable<Effect<R, E, A>>) {
  return Effect.collectAll(Chunk.from(as))
}

// /**
//  * @tsplus fluent ets/Array forEachSync
//  * @tsplus fluent Chunk forEachSync
//  * @tsplus fluent ets/Set forEachSync
//  */
// export const ext_forEachSync_ = forEachSync_

// /**
//  * @tsplus fluent ets/Array collectAllSync
//  * @tsplus fluent Chunk collectAllSync
//  * @tsplus fluent ets/Set collectAllSync
//  */
// export const ext_collectAllSync = collectAllSync

/**
 * @tsplus fluent ets/Array toChunk
 * @tsplus fluent ets/Set toChunk
 */
export const ext_from = Chunk.from
