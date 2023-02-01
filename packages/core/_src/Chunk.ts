import { Option } from "./Option.js"

import * as Chunk from "@fp-ts/data/Chunk"

export * from "@fp-ts/data/Chunk"

/**
 * @tsplus pipeable fp-ts/data/Chunk sortWith
 */
export function ChunksortWith<A>(
  ...ords: NonEmptyArguments<Order<A>>
): (a: Chunk.Chunk<A>) => Chunk.Chunk<A> {
  // TODO
  return as => as.toArray.sortWith(...ords).toChunk
}

/**
 * @tsplus fluent fp-ts/data/Chunk groupByT
 */
export function groupByTChunk_<A, Key extends PropertyKey>(c: Chunk.Chunk<A>, f: (a: A) => Key) {
  return c.toReadonlyArray().groupByT(f).toChunk
}

/**
 * Returns the first element that satisfies the predicate.
 *
 * @tsplus static fp-ts/data/Chunk.Ops findFirstMap
 * @tsplus pipeable fp-ts/data/Chunk findFirstMap
 */
export function findFirstMap<A, B>(
  f: (a: A) => Option<B>
) {
  return (as: Chunk.Chunk<A>) => {
    const ass = as.toReadonlyArray()
    const len = ass.length
    for (let i = 0; i < len; i++) {
      const v = f(ass[i]!)
      if (v.isSome()) {
        return v
      }
    }
    return Option.none
  }
}

/**
 * @tsplus getter fp-ts/data/Chunk toArray
 */
export function toArray<T>(c: Chunk.Chunk<T>) {
  return c.toReadonlyArray()
}

/**
 * Remove duplicates from an array, keeping the first occurrence of an element.
 *
 * @tsplus static fp-ts/data/Chunk.Ops uniq
 * @tsplus pipeable fp-ts/data/Chunk uniq
 */
export function uniq<A>(E: Equivalence<A>) {
  return (self: Chunk.Chunk<A>): Chunk.Chunk<A> => {
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
  return (self: Chunk.Chunk<A>): boolean => {
    for (let i = 0; i < self.length; i++) {
      if (E(self.unsafeGet(i)!, value)) {
        return true
      }
    }
    return false
  }
}

/**
 * @tsplus pipeable fp-ts/data/Chunk partition
 */
export const ChunkPartition = Chunk.partition

/**
 * @tsplus fluent fp-ts/data/Chunk findFirst
 */
export const findFirstSimple: {
  <A, B extends A>(self: Chunk.Chunk<A>, refinement: Refinement<A, B>): Option<B>
  <A>(self: Chunk.Chunk<A>, predicate: Predicate<A>): Option<A>
} = Chunk.findFirst

/**
 * @tsplus fluent fp-ts/data/Chunk findLast
 */
export const findLastSimple: {
  <A, B extends A>(self: Chunk.Chunk<A>, refinement: Refinement<A, B>): Option<B>
  <A>(self: Chunk.Chunk<A>, predicate: Predicate<A>): Option<A>
} = Chunk.findLast
