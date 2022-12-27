import { identity } from "./Function.js"

import * as ROA from "@fp-ts/data/ReadonlyArray"

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
 * @tsplus static fp-ts/data/ReadonlyArray.Ops findFirstMap
 * @tsplus static ReadonlyArray.Ops findFirstMap
 * @tsplus pipeable fp-ts/data/ReadonlyArray findFirstMap
 * @tsplus pipeable ReadonlyArray findFirstMap
 * @tsplus pipeable NonEmptyArray findFirstMap
 * @tsplus pipeable NonEmptyArrayReadonlyArray findFirstMap
 */
export function findFirstMap<A, B>(
  f: (a: A) => Opt<B>
) {
  return (as: ReadonlyArray<A>) => {
    const len = as.length
    for (let i = 0; i < len; i++) {
      const v = f(as[i]!)
      if (v.isSome()) {
        return v
      }
    }
    return Opt.none
  }
}

/**
 * @tsplus pipeable ReadonlyArray sortByO
 * @tsplus pipeable NonEmptyArray sortByO
 * @tsplus pipeable NonEmptyArrayReadonlyArray sortByO
 */
export function sortByO<A>(
  ords: Opt<NonEmptyReadonlyArray<Ord<A>>>
): (a: ReadonlyArray<A>) => ReadonlyArray<A> {
  return ords.match(() => identity, _ => ROA.sortBy(..._))
}

/**
 * @tsplus fluent ReadonlyArray groupByT
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
      r[k]!.push(a)
    } else {
      r[k] = [a]
    }
  }
  return Object.entries(r).map(([k, items]) => tuple(k as unknown as Key, items as NonEmptyReadonlyArray<A>))
}

// /**
//  * @tsplus fluent ReadonlyArray collect
//  */
// export function arrayCollect<A, B>(ar: readonly A[], collector: (a: A) => Opt<B>): readonly B[] {
//   return Chunk.fromIterable(ar).filterMap(collector).toArray
// }

/**
 * @tsplus operator ReadonlyArray &
 * @tsplus fluent ReadonlyArray concat
 */
export function concat_<A, B>(
  self: ROArray<A>,
  that: ROArray<B>
): ROArray<A | B> {
  return [...self, ...that]
}

/**
 * Concatenates two ReadonlyArray together
 *
 * @tsplus operator ReadonlyArray +
 */
export const concatOperator: <A>(
  self: ROArray<A>,
  that: ROArray<A>
) => ROArray<A> = concat_

/**
 * Prepends `a` to ROArray<A>
 *
 * @tsplus operator ReadonlyArray + 1.0
 */
export function prependOperatorStrict<A>(a: A, self: ROArray<A>): ROArray<A> {
  return ROA.prepend(a)(self)
}

/**
 * Prepends `a` to ROArray<A>
 *
 * @tsplus operator ReadonlyArray >
 */
export function prependOperator<A, B>(a: A, self: ROArray<B>): ROArray<A | B> {
  return prepend_(self, a)
}

/**
 * Prepends `a` to ROArray<A>
 *
 * @tsplus fluent ReadonlyArray prepend
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
 * @tsplus fluent ReadonlyArray append
 * @tsplus operator ReadonlyArray <
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
 * @tsplus operator ReadonlyArray + 1.0
 */
export const appendOperator: <A>(self: ROArray<A>, a: A) => ROArray<A> = append_

/**
 * @tsplus fluent ReadonlyArray randomElement 1
 */
export function randomElement<A>(a: ROArray<A>) {
  return a[Math.floor(Math.random() * a.length)]
}

/**
 * @tsplus fluent ets/NonEmptyArray randomElement 2
 */
export function randomElementNA<A>(a: NonEmptyReadonlyArray<A>): A {
  return a[Math.floor(Math.random() * a.length)]
}

/**
 * @tsplus pipeable ets/NonEmptyArray mapRA
 */
export const mapRA = ROA.mapNonEmpty

/**
 * @tsplus fluent ets/NonEmptyArray sortBy
 */
export function sortBy<A>(na: NonEmptyReadonlyArray<A>, ords: readonly Ord<A>[]) {
  return ROA.sortBy(...ords)(na) as unknown as NonEmptyReadonlyArray<A>
}

/**
 * @tsplus fluent ets/NonEmptyArray sortWith
 */
export function sortWith<A>(na: NonEmptyReadonlyArray<A>, ord: Ord<A>) {
  return ROA.sortNonEmpty(ord)(na as readonly [A, ...A[]])
}

/**
 * @tsplus static ets/NonEmptyArray __call
 */
export const makeNA = ReadonlyArray.make

/**
 * @tsplus fluent fp-ts/data/Chunk groupByT
 */
export function groupByTChunk_<A, Key extends PropertyKey>(c: Chunk<A>, f: (a: A) => Key) {
  return c.toReadonlyArray().groupByT(f).toChunk
}

/**
 * @tsplus fluent ReadonlyArray filterWith
 */
export function filterWith<A>(self: ROArray<A>, predicates: ROArray<Predicate<A>>) {
  return self.filter(_ => predicates.every(f => f(_)))
}

/**
 * Split the `items` array into multiple, smaller chunks of the given `size`.
 */
export function* _chunk_<T>(items_: Iterable<T>, size: number) {
  const items = ([] as T[]).concat(...items_)

  while (items.length) {
    yield items.splice(0, size)
  }
}

/**
 * Split the `items` array into multiple, smaller chunks of the given `size`.
 * @tsplus fluent ReadonlyArray chunk
 * @tsplus fluent fp-ts/data/Chunk chunk
 * @tsplus fluent Collection chunk
 */
export function chunk_<T>(items_: Iterable<T>, size: number) {
  return Chunk.fromIterable(_chunk_(items_, size))
}

/**
 * @tsplus getter ReadonlyArray toChunk
 * @tsplus getter Collection toChunk
 */
export function toChunk<T>(items: Iterable<T>) {
  return Chunk.fromIterable(items)
}

/**
 * @tsplus getter ReadonlyArray toNonEmpty
 */
export const toNonEmptyArray = <A>(a: ReadonlyArray<A>) => a.length ? Opt.some(a as NonEmptyReadonlyArray<A>) : Opt.none

/**
 * @tsplus getter Iterable toArray
 * @tsplus getter Iterator toArray
 * @tsplus getter Generator toArray
 */
export const iterableToArray = Array.from

/**
 * @tsplus getter Collection toNonEmptyArray
 */
export function CollectionToNonEmptyReadonlyArray<A>(c: Iterable<A>) {
  return iterableToArray(c).toNonEmpty
}

/**
 * @tsplus getter fp-ts/data/Chunk toNonEmptyArray
 */
export function ChunkToNonEmptyReadonlyArray<A>(c: Chunk<A>) {
  return c.toArray.toNonEmpty
}

/**
 * @tsplus fluent ReadonlyArray forEachEffectPar
 */
export function ext_forEachEffectPar<A, R, E, B>(
  as: ReadonlyArray<A>,
  f: (a: A) => Effect<R, E, B>
) {
  return Effect.forEachPar(f)(as)
}

/**
 * @tsplus fluent fp-ts/data/Chunk forEachEffectPar
 */
export function ext_CNKforEachEffectPar<A, R, E, B>(
  as: Chunk<A>,
  f: (a: A) => Effect<R, E, B>
) {
  return Effect.forEachPar(f)(as)
}

/**
 * @tsplus fluent ets/NonEmptyArray forEachEffectPar
 */
export function ext_NAforEachEffectPar<A, R, E, B>(
  as: NonEmptyReadonlyArray<A>,
  f: (a: A) => Effect<R, E, B>
) {
  return Effect.forEachPar(f)(as).map(_ => _.toNonEmptyReadonlyArray.value!)
}

/**
 * @tsplus fluent ets/NonEmptyArray forEachEffect
 */
export function ext_NAforEach<A, R, E, B>(as: NonEmptyReadonlyArray<A>, f: (a: A) => Effect<R, E, B>) {
  return Effect.forEach(f)(as).map(_ => _.toNonEmptyReadonlyArray.value!)
}

/**
 * @tsplus fluent ets/NonEmptyArray forEachEffectWithIndexPar
 */
export function ext_NAforEachEffectWithIndexPar<A, R, E, B>(
  as: NonEmptyReadonlyArray<A>,
  f: (a: A, i: number) => Effect<R, E, B>
) {
  return Effect.forEachParWithIndex(f)(as).map(_ => _.toNonEmptyReadonlyArray.value!)
}

/**
 * @tsplus fluent ets/NonEmptyArray forEachEffectWithIndex
 */
export function ext_NAforEachWithIndex<A, R, E, B>(
  as: NonEmptyReadonlyArray<A>,
  f: (a: A, i: number) => Effect<R, E, B>
) {
  return Effect.forEachWithIndex(f)(as).map(_ => _.toNonEmptyReadonlyArray.value!)
}

/**
 * @tsplus fluent ReadonlyArray forEachEffectWithIndex
 * @tsplus fluent fp-ts/data/Chunk forEachEffectWithIndex
 * @tsplus fluent fp-ts/data/Chunk forEachEffectWithIndex
 * @tsplus fluent ets/Set forEachEffectWithIndex
 */
export function ext_forEachWithIndex<A, R, E, B>(as: Iterable<A>, f: (a: A, i: number) => Effect<R, E, B>) {
  return Effect.forEachWithIndex(f)(as)
}

/**
 * @tsplus fluent ReadonlyArray forEachEffectParWithIndex
 * @tsplus fluent fp-ts/data/Chunk forEachEffectParWithIndex
 * @tsplus fluent fp-ts/data/Chunk forEachEffectParWithIndex
 * @tsplus fluent ets/Set forEachEffectParWithIndex
 */
export function ext_forEachParWithIndex<A, R, E, B>(as: Iterable<A>, f: (a: A, i: number) => Effect<R, E, B>) {
  return Effect.forEachParWithIndex(f)(as)
}

/**
 * @tsplus getter Iterable toChunk
 * @tsplus getter Iterator toChunk
 * @tsplus getter Generator toChunk
 */
export const ext_itToChunk = Chunk.fromIterable
