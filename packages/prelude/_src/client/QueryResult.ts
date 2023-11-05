// TODO: Convert to effect/core

/* eslint-disable @typescript-eslint/ban-types */

/**
 * @tsplus getter effect/io/Effect asQueryResult
 */
export function queryResult<R, E, A>(
  self: Effect<R, E, A>
): Effect<R, never, Result.Result<E, A>> {
  return self.match({
    onFailure: (_) => Result.fail<E, A>(_),
    onSuccess: (_) => Result.success<E, A>(_)
  })
}

export class QueryResult<E, A> {
  constructor(readonly latest: Result.Result<E, A>, readonly latestSuccess: A | undefined) {}
}
