/**
 * @tsplus pipeable fp-ts/data/Either mapBoth
 */
export function mapBoth<E, A, EA, AA>(onLeft: (e: E) => EA, onRight: (a: A) => AA) {
  return (ei: Either<E, A>) => ei.mapLeft(onLeft).map(onRight)
}
