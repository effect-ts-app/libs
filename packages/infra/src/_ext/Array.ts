import { Chunk, Equal } from "effect-app"
import type { ObjectOps } from "effect-app/utils"
import { inspect } from "util"
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
    .findFirst((_) => Equal.equals(_.id, id))
    .mapError(() => new NotFoundError<Type>({ type, id }))
}

/**
 * @tsplus fluent Object.Ops inspect
 */
export function RecordInspect<TT extends object>(
  o: ObjectOps<TT>,
  showHidden?: boolean | undefined,
  depth?: number | null | undefined,
  color?: boolean | undefined
) {
  return inspect(o.subject, showHidden, depth, color)
}
