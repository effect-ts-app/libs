import { Chunk, Effect, Equal } from "effect-app"
import { NotFoundError } from "../errors.js"

/**
 * @tsplus fluent Array getFirstById
 * @tsplus fluent effect/data/Chunk getFirstById
 * @tsplus fluent ets/Set getFirstById
 * @tsplus fluent Array getFirstById
 * @tsplus fluent ReadonlyArray getFirstById
 */
export function getFirstById<A extends { id: unknown }, Type extends string>(
  a: Iterable<A>,
  id: A["id"],
  type: Type
) {
  return Chunk
    .fromIterable(a)
    .pipe(
      Chunk.findFirst((_) => Equal.equals(_.id, id)),
      Effect.mapError(() => new NotFoundError<Type>({ type, id }))
    )
}
