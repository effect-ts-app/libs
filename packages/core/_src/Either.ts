export * from "@fp-ts/core/Either"

/**
 * @tsplus pipeable fp-ts/core/Either mapBoth
 */
export function mapBoth<E, A, EA, AA>(onLeft: (e: E) => EA, onRight: (a: A) => AA) {
  return (ei: Either<E, A>) => ei.mapLeft(onLeft).map(onRight)
}
