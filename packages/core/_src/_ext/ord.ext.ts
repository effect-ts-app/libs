import * as CNK from "@effect/data/Chunk"
import * as ORD from "@effect/data/Order"

/**
 * @tsplus pipeable effect/data/Chunk sortWith
 */
export function sortWith<A>(
  ...ords: NonEmptyArguments<Order<A>>
): (a: Chunk<A>) => Chunk<A> {
  // TODO
  return (as) => as.toReadonlyArray.sortWith(...ords).toChunk
}

/**
 * @tsplus getter Generator toArray
 */
export function toArray<A>(
  gen: Generator<A, void, unknown>
) {
  return Array.from(gen)
}

/**
 * Remove duplicates from an array, keeping the first occurrence of an element.
 *
 * @tsplus static ReadonlyArray.Ops uniq
 * @tsplus pipeable ReadonlyArray uniq
 */
export function uniqArray<A>(E: Equivalence<A>) {
  return (self: ReadonlyArray<A>): ReadonlyArray<A> => {
    const includes = arrayIncludes(E)
    const result: Array<A> = []
    const length = self.length
    let i = 0
    for (; i < length; i = i + 1) {
      const a = self[i]!
      if (!includes(result, a)) {
        result.push(a)
      }
    }
    return length === result.length ? self : result
  }
}

function arrayIncludes<A>(E: Equivalence<A>) {
  return (array: Array<A>, value: A): boolean => {
    for (let i = 0; i < array.length; i = i + 1) {
      const element = array[i]!
      if (E(element, value)) {
        return true
      }
    }
    return false
  }
}

/**
 * Remove duplicates from an array, keeping the first occurrence of an element.
 *
 * @tsplus static effect/data/Chunk.Ops uniq
 * @tsplus pipeable effect/data/Chunk uniq
 */
export function uniq<A>(E: Equivalence<A>) {
  return (self: Chunk<A>): Chunk<A> => {
    let out = ([] as A[]).toChunk
    for (let i = 0; i < self.length; i++) {
      const a = self.unsafeGet(i)
      if (!out.elem2(E, a)) {
        out = out.append(a)
      }
    }
    return self.length === out.length ? self : out
  }
}

/**
 * Test if a value is a member of an array. Takes a `Equivalence<A>` as a single
 * argument which returns the function to use to search for a value of type `A`
 * in an array of type `Chunk<A>`.
 *
 * @tsplus static effect/data/Chunk.Ops elem2
 * @tsplus pipeable effect/data/Chunk elem2
 */
export function elem<A>(E: Equivalence<A>, value: A) {
  return (self: Chunk<A>): boolean => {
    for (let i = 0; i < self.length; i++) {
      if (E(self.unsafeGet(i)!, value)) {
        return true
      }
    }
    return false
  }
}

/**
 * @tsplus pipeable ReadonlyArray sortWithNonEmpty
 */
export function sortWithNonEmpty<A>(
  ...ords: NonEmptyArguments<Order<A>>
): (a: NonEmptyReadonlyArray<A>) => NonEmptyArray<A> {
  return (a) => a.sortByNonEmpty(...ords)
}

/**
 * @tsplus pipeable effect/data/Chunk partition
 */
export const ChunkPartition = CNK.partition

/**
 * @tsplus pipeable effect/data/Order contramap
 */
export const OrdContramap = ORD.contramap

/**
 * @tsplus getter effect/data/Order inverted
 */
export const OrdInverted = ORD.reverse
