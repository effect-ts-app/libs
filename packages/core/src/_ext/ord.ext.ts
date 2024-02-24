import * as CNK from "effect/Chunk"
import type { Chunk, Equivalence } from "../Prelude.js"

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
      if (E(self.unsafeGet(i), value)) {
        return true
      }
    }
    return false
  }
}

/**
 * @tsplus pipeable effect/data/Chunk partition
 */
export const ChunkPartition = CNK.partition
