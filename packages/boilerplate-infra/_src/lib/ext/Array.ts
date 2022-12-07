import type { ObjectOps } from "@effect-ts-app/boilerplate-prelude/utils"
import { inspect } from "util"
import { NotFoundError } from "../../errors.js"

/**
 * @tsplus fluent ets/Array getFirstById
 * @tsplus fluent Chunk getFirstById
 * @tsplus fluent ets/Set getFirstById
 * @tsplus fluent Array getFirstById
 * @tsplus fluent ReadonlyArray getFirstById
 */
export function getFirstById_<A extends { id: Id }, Id extends string, Type extends string>(
  a: Iterable<A>,
  id: Id,
  type: Type
) {
  return Chunk.from(a)
    .find(_ => _.id === id)
    .encaseInEffect(() => new NotFoundError(type, id))
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
