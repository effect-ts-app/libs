import { pipe, type Predicate, type Refinement } from "./Function.js"
import * as Option from "./Option.js"

import * as Chunk from "effect/Chunk"
import * as Array from "./Array.js"
import type { Equivalence } from "./index.js"

export * from "effect/Chunk"

/**
 * @tsplus getter Array toChunk
 * @tsplus getter ReadonlyArray toChunk
 * @tsplus getter Iterable toChunk
 * @tsplus getter Iterator toChunk
 * @tsplus getter Generator toChunk
 */
export const fromIterable = Chunk.fromIterable

/**
 * @tsplus fluent effect/data/Chunk groupByT
 */
export function groupByTChunk_<A, Key extends PropertyKey>(c: Chunk.Chunk<A>, f: (a: A) => Key) {
  return pipe(Chunk.toReadonlyArray(c), Array.groupByT(f), Chunk.fromIterable)
}

/**
 * Returns the first element that satisfies the predicate.
 *
 * @tsplus static effect/data/Chunk.Ops findFirstMap
 * @tsplus pipeable effect/data/Chunk findFirstMap
 */
export function findFirstMap<A, B>(
  f: (a: A) => Option.Option<B>
) {
  return (as: Chunk.Chunk<A>) => {
    const ass = Chunk.toReadonlyArray(as)
    const len = ass.length
    for (let i = 0; i < len; i++) {
      const v = f(ass[i])
      if (Option.isSome(v)) {
        return v
      }
    }
    return Option.none()
  }
}

/**
 * @tsplus getter effect/data/Chunk toArray
 */
export function toArray<T>(c: Chunk.Chunk<T>): T[] {
  return Chunk.toReadonlyArray(c) as T[]
}

/**
 * Remove duplicates from an array, keeping the first occurrence of an element.
 *
 * @tsplus static effect/data/Chunk.Ops uniq
 * @tsplus pipeable effect/data/Chunk uniq
 */
export function uniq<A>(E: Equivalence<A>) {
  return (self: Chunk.Chunk<A>): Chunk.Chunk<A> => {
    let out = Chunk.fromIterable([] as A[])
    for (let i = 0; i < self.length; i++) {
      const a = Chunk.unsafeGet(self, i)
      if (!elem(E, a)(out)) {
        out = Chunk.append(out, a)
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
  return (self: Chunk.Chunk<A>): boolean => {
    for (let i = 0; i < self.length; i++) {
      if (E(Chunk.unsafeGet(self, i), value)) {
        return true
      }
    }
    return false
  }
}

/**
 * @tsplus pipeable effect/data/Chunk partition
 */
export const ChunkPartition = Chunk.partition

/**
 * @tsplus fluent effect/data/Chunk findFirst
 */
export const findFirstSimple: {
  <A, B extends A>(self: Chunk.Chunk<A>, refinement: Refinement<A, B>): Option.Option<B>
  <A>(self: Chunk.Chunk<A>, predicate: Predicate<A>): Option.Option<A>
} = Chunk.findFirst

/**
 * @tsplus fluent effect/data/Chunk findLast
 */
export const findLastSimple: {
  <A, B extends A>(self: Chunk.Chunk<A>, refinement: Refinement<A, B>): Option.Option<B>
  <A>(self: Chunk.Chunk<A>, predicate: Predicate<A>): Option.Option<A>
} = Chunk.findLast
