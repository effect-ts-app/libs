import { concreteChunkId } from "@tsplus/stdlib/collections/Chunk"
import type { Array as ROArray } from "../Prelude.js"
import { Array as ROArrayOps } from "../Prelude.js"

/**
 * Returns the first element that satisfies the predicate.
 *
 * @tsplus static Chunk.Aspects findMap
 * @tsplus pipeable Chunk findMap
 */
export function findMap<A, B>(f: (a: A) => Maybe<B>): (self: Chunk<A>) => Maybe<B> {
  return (self: Chunk<A>): Maybe<B> => {
    const iterator = concreteChunkId(self)._arrayLikeIterator()
    let next

    while ((next = iterator.next()) && !next.done) {
      const array = next.value
      const len = array.length
      let i = 0
      while (i < len) {
        const a = array[i]!
        const r = f(a)
        if (r._tag === "Some") {
          return r
        }
        i++
      }
    }

    return Maybe.none
  }
}

/**
 * @tsplus fluent ets/Array collect
 */
export function arrayCollect<A, B>(ar: readonly A[], collector: (a: A) => Maybe<B>): readonly B[] {
  return Chunk.from(ar).collect(collector).toArray
}

/**
 * @tsplus fluent ets/Array findMap
 */
export function arrayFindMap<A, B>(ar: readonly A[], collector: (a: A) => Maybe<B>): Maybe<B> {
  return Chunk.from(ar).findMap(collector)
}

/**
 * @tsplus fluent ets/Array findFirstRA
 * @tsplus fluent ets/Array findFirst
 */
export function arrayFindFirst_<A, B extends A>(
  as: ROArray<A>,
  refinement: Refinement<A, B>
): Maybe<B>
export function arrayFindFirst_<A>(as: ROArray<A>, predicate: Predicate<A>): Maybe<A>
export function arrayFindFirst_<A>(as: ROArray<A>, predicate: Predicate<A>): Maybe<A> {
  return Chunk.from(as).find(predicate)
}

/**
 * @tsplus operator ets/Array &
 * @tsplus fluent ets/Array concat
 */
export function concat_<A, B>(
  self: ROArray<A>,
  that: ROArray<B>
): ROArray<A | B> {
  return ROArrayOps.concat_(self, that)
}

/**
 * Concatenates two ets/Array together
 *
 * @tsplus operator ets/Array +
 */
export const concatOperator: <A>(
  self: ROArray<A>,
  that: ROArray<A>
) => ROArray<A> = concat_

/**
 * Prepends `a` to ROArray<A>
 *
 * @tsplus operator ets/Array + 1.0
 */
export function prependOperatorStrict<A>(a: A, self: ROArray<A>): ROArray<A> {
  return ROArrayOps.prepend_(self, a)
}

/**
 * Prepends `a` to ROArray<A>
 *
 * @tsplus operator ets/Array >
 */
export function prependOperator<A, B>(a: A, self: ROArray<B>): ROArray<A | B> {
  return prepend_(self, a)
}

/**
 * Prepends `a` to ROArray<A>
 *
 * @tsplus fluent ets/Array prepend
 */
export function prepend_<A, B>(tail: ROArray<A>, head: B): ROArray<A | B> {
  const len = tail.length
  const r = Array(len + 1)
  for (let i = 0; i < len; i++) {
    r[i + 1] = tail[i]
  }
  r[0] = head
  return r as unknown as ROArray<A | B>
}

/**
 * Appends `a` to ROArray<A>
 *
 * @tsplus fluent ets/Array append
 * @tsplus operator ets/Array <
 */
export function append_<A, B>(init: ROArray<A>, end: B): ROArray<A | B> {
  const len = init.length
  const r = Array(len + 1)
  for (let i = 0; i < len; i++) {
    r[i] = init[i]
  }
  r[len] = end
  return r as unknown as ROArray<A | B>
}

/**
 * @tsplus operator ets/Array + 1.0
 */
export const appendOperator: <A>(self: ROArray<A>, a: A) => ROArray<A> = append_
