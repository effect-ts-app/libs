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
