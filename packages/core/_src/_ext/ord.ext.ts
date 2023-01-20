import * as ORD from "@effect-ts/core/Ord"
import type { Ord } from "@effect-ts/core/Ord"
import * as CNK from "@fp-ts/data/Chunk"

/**
 * @tsplus getter ets/Ord toOrder
 */
export function convertOrd<A>(_: Ord<A>): Order<A> {
  return ({ compare: x => y => _.compare(x, y) })
}

/**
 * @tsplus pipeable fp-ts/data/Chunk sortWith
 */
export function sortWith<A>(
  ...ords: NonEmptyArguments<Ord<A>>
): (a: Chunk<A>) => Chunk<A> {
  // TODO
  return as => as.toArray.sortWith(...ords).toChunk
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
      if (E(value)(element)) {
        return true
      }
    }
    return false
  }
}

/**
 * Remove duplicates from an array, keeping the first occurrence of an element.
 *
 * @tsplus static fp-ts/data/Chunk.Ops uniq
 * @tsplus pipeable fp-ts/data/Chunk uniq
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
 * @tsplus static fp-ts/data/Chunk.Ops elem2
 * @tsplus pipeable fp-ts/data/Chunk elem2
 */
export function elem<A>(E: Equivalence<A>, value: A) {
  return (self: Chunk<A>): boolean => {
    const predicate = E(value)
    for (let i = 0; i < self.length; i++) {
      if (predicate(self.unsafeGet(i)!)) {
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
  ...ords: NonEmptyArguments<Ord<A>>
): (a: NonEmptyReadonlyArray<A>) => NonEmptyArray<A> {
  return a => a.sortByNonEmpty(...ords.map(convertOrd))
}

/**
 * @tsplus pipeable fp-ts/data/Chunk partition
 */
export const ChunkPartition = CNK.partition

/**
 * @tsplus fluent ets/Ord contramap
 */
export const OrdContramap = ORD.contramap_

/**
 * @tsplus getter ets/Ord inverted
 */
export const OrdInverted = ORD.inverted
