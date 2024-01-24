import * as ROArray from "effect/ReadonlyArray"
import { identity } from "./Function.js"
import * as Option from "./Option.js"

import * as T from "effect/Effect"

import * as Dur from "effect/Duration"

export * from "effect/ReadonlyArray"

/**
 * @tsplus getter Generator toArray
 * @tsplus getter Iterable toArray
 */
export function toArray<A>(
  gen: Generator<A, void, unknown>
) {
  return Array.from(gen)
}

/** @tsplus getter ReadonlyArray flatten */
export const flane: <A>(self: NonEmptyReadonlyArray<NonEmptyReadonlyArray<A>>) => NonEmptyArray<A> = ROArray.flatten

/** @tsplus getter ReadonlyArray flatten */
export const fla: <A>(self: ReadonlyArray<ReadonlyArray<A>>) => Array<A> = ROArray.flatten

/** @tsplus pipeable ReadonlyArray sortBy */
export const sortByne: <B>(
  ...orders: ReadonlyArray<Order<B>>
) => <A extends B>(as: readonly [A, ...A[]]) => [A, ...A[]] = ROArray.sortBy as any

/** @tsplus pipeable Iterable sortBy */
export const sortBy: <B>(...orders: readonly Order<B>[]) => <A extends B>(self: Iterable<A>) => A[] = ROArray
  .sortBy as any

/**
 * Remove duplicates from an array, keeping the first occurrence of an element.
 *
 * @tsplus pipeable Array uniq
 * @tsplus pipeable ReadonlyArray uniq
 * @tsplus static effect/data/ReadonlyArray.Ops uniq
 */
export function uniq<A>(E: Equivalence<A>) {
  return (self: ReadonlyArray<A>): ReadonlyArray<A> => {
    const includes = arrayIncludes(E)
    const result: Array<A> = []
    const length = self.length
    let i = 0
    for (; i < length; i = i + 1) {
      const a = self[i]
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
      const element = array[i]
      if (E(element, value)) {
        return true
      }
    }
    return false
  }
}

/**
 * @tsplus static effect/data/Duration.Ops makeMillis
 */
export const millis_ = Dur.millis

export const { isArray } = Array

// export function deleteOrOriginal_<A>(as: ReadonlyArray<A>, a: A) {
//   return as.remove(findIndexOrElse_(as, x => x === a))
// }

// export function deleteAtOrOriginal<A>(i: number) {
//   return (as: ReadonlyArray<A>) => deleteAtOrOriginal_(as, i)
// }

// export function deleteOrOriginal<A>(a: A) {
//   return (as: ReadonlyArray<A>) => deleteOrOriginal_(as, a)
// }

/**
 * @tsplus static effect/data/ReadonlyArray.Ops findFirstMap
 * @tsplus static Array.Ops findFirstMap
 * @tsplus fluent Array findFirstMap
 * @tsplus fluent effect/data/ReadonlyArray findFirstMap
 * @tsplus fluent ReadonlyArray findFirstMap
 * @tsplus fluent NonEmptyArray findFirstMap
 * @tsplus fluent NonEmptyArrayReadonlyArray findFirstMap
 */
export const findFirstMap = ROArray.findFirst

/**
 * @tsplus static effect/data/ReadonlyArray.Ops findLastMap
 * @tsplus static Array.Ops findLastMap
 * @tsplus fluent Array findLastMap
 * @tsplus fluent effect/data/ReadonlyArray findLastMap
 * @tsplus fluent ReadonlyArray findLastMap
 * @tsplus fluent NonEmptyArray findLastMap
 * @tsplus fluent NonEmptyArrayReadonlyArray findLastMap
 */
export const findLastMap = ROArray.findLast

/**
 * @tsplus static effect/data/ReadonlyArray/NonEmptyArray.Ops fromArray
 */
export function NEAFromArray<T>(ar: Array<T>) {
  return ar.length ? Option.some(ar as NonEmptyArray<T>) : Option.none
}

/**
 * @tsplus static effect/data/ReadonlyArray/NonEmptyReadonlyArray.Ops fromArray
 */
export function NEROArrayFromArray<T>(ar: ReadonlyArray<T>) {
  return ar.length ? Option.some(ar as NonEmptyReadonlyArray<T>) : Option.none
}

/**
 * @tsplus pipeable Array sortByO
 * @tsplus pipeable ReadonlyArray sortByO
 * @tsplus pipeable NonEmptyArray sortByO
 * @tsplus pipeable NonEmptyArrayReadonlyArray sortByO
 */
export function sortByO<A>(
  ords: Option.Option<NonEmptyReadonlyArray<Order<A>>>
): (a: ReadonlyArray<A>) => ReadonlyArray<A> {
  return ords.match({ onNone: () => identity, onSome: (_) => ROArray.sortBy(..._) })
}

/**
 * @tsplus fluent ReadonlyArray groupByT
 * @tsplus fluent Array groupByT
 * @tsplus fluent NonEmptyArray groupByT
 * @tsplus fluent NonEmptyArrayReadonlyArray groupByT
 */
export function groupByT<A, Key extends PropertyKey>(
  as: ReadonlyArray<A>,
  f: (a: A) => Key
): ReadonlyArray<readonly [Key, NonEmptyReadonlyArray<A>]> {
  const r: Record<Key, Array<A> & { 0: A }> = {} as any
  for (const a of as) {
    const k = f(a)
    // eslint-disable-next-line no-prototype-builtins
    if (r.hasOwnProperty(k)) {
      r[k].push(a)
    } else {
      r[k] = [a]
    }
  }
  return Object.entries(r).map(([k, items]) => tuple(k as unknown as Key, items as NonEmptyReadonlyArray<A>))
}

// A getter would be nice, but we need it fluent to manage the priority vs nonEmpty etc
/**
 * @tsplus fluent ReadonlyArray randomElement 2
 */
export function randomElement<A>(a: ReadonlyArray<A>): A | undefined {
  return a[Math.floor(Math.random() * a.length)]
}

// must put on top of ReadonlyArray for it to work with [A, ...A[]] etc
/**
 * @tsplus fluent ReadonlyArray randomElement 1
 */
export function randomElementNA<A>(a: NonEmptyReadonlyArray<A>): A {
  return a[Math.floor(Math.random() * a.length)]
}

/**
 * @tsplus fluent ReadonlyArray filterWith
 */
export function filterWith<A>(self: ReadonlyArray<A>, predicates: ReadonlyArray<Predicate<A>>) {
  return self.filter((_) => predicates.every((f) => f(_)))
}

/**
 * Split the `items` array into multiple, smaller chunks of the given `size`.
 */
export function* _chunk_<T>(items_: Iterable<T>, size: number) {
  const items = [...items_]

  while (items.length) {
    yield items.splice(0, size)
  }
}

/**
 * Split the `items` array into multiple, smaller chunks of the given `size`.
 * @tsplus fluent Array chunk
 * @tsplus fluent ReadonlyArray chunk
 * @tsplus fluent effect/data/Chunk chunk
 * @tsplus fluent Iterable chunk
 */
export function chunk_<T>(items_: Iterable<T>, size: number) {
  return Chunk.fromIterable(_chunk_(items_, size))
}

/**
 * @tsplus getter Array toChunk
 * @tsplus getter ReadonlyArray toChunk
 * @tsplus getter Iterable toChunk
 */
export function toChunk<T>(items: Iterable<T>) {
  return Chunk.fromIterable(items)
}

/**
 * @tsplus getter ReadonlyArray toNonEmpty
 * @tsplus getter Array toNonEmpty
 * @tsplus getter effect/data/ReadonlyArray toNonEmpty
 */
export const toNonEmptyArray = <A>(a: ReadonlyArray<A>) =>
  a.length ? Option.some(a as NonEmptyReadonlyArray<A>) : Option.none

/**
 * @tsplus getter Iterable toArray
 * @tsplus getter Iterator toArray
 * @tsplus getter Generator toArray
 */
export const iterableToArray = Array.from

/**
 * @tsplus getter Iterable toNonEmptyArray
 */
export function CollectionToNonEmptyReadonlyArray<A>(c: Iterable<A>) {
  return iterableToArray(c).toNonEmpty
}

/**
 * @tsplus getter effect/data/Chunk asNonEmptyArray
 */
export function NonEmptyChunkToNonEmptyReadonlyArray<A>(c: NonEmptyChunk<A>) {
  return c.toArray.toNonEmpty.value!
}

/**
 * @tsplus getter effect/data/Chunk toNonEmptyArray
 */
export function ChunkToNonEmptyReadonlyArray<A>(c: Chunk<A>) {
  return c.toArray.toNonEmpty
}

/**
 * @tsplus fluent effect/data/ReadonlyArray/NonEmptyReadonlyArray forEachEffect
 */
export function ext_NAforEach<A, R, E, B>(as: NonEmptyReadonlyArray<A>, f: (a: A) => Effect<R, E, B>) {
  return T.forEach(as, f).map((_) => _.toNonEmptyArray.value!)
}

/**
 * @tsplus getter Iterable toChunk
 * @tsplus getter Iterator toChunk
 * @tsplus getter Generator toChunk
 */
export const ext_itToChunk = Chunk.fromIterable
