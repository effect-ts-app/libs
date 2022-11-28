import type { Predicate } from "../Function.js"
import { ROArray } from "../index.js"

/**
 * @tsplus fluent ets/Array randomElement 1
 */
export function randomElement<A>(a: ROArray<A>) {
  return a[Math.floor(Math.random() * a.length)]
}

/**
 * @tsplus fluent ets/NonEmptyArray randomElement 2
 */
export function randomElementNA<A>(a: NonEmptyArray<A>): A {
  return a[Math.floor(Math.random() * a.length)] as A
}

/**
 * @tsplus fluent ets/NonEmptyArray mapRA
 */
export const mapRA = NonEmptyArray.map_

/**
 * @tsplus fluent ets/NonEmptyArray sortBy
 */
export function sortBy<A>(na: NonEmptyArray<A>, ords: readonly Ord<A>[]) {
  return ROArray.sortBy(ords)(na) as NonEmptyArray<A>
}

/**
 * @tsplus fluent ets/NonEmptyArray sortWith
 */
export function sortWith<A>(na: NonEmptyArray<A>, ord: Ord<A>) {
  return NonEmptyArray.sort(ord)(na)
}

/**
 * @tsplus static ets/NonEmptyArray __call
 */
export const makeNA = NonEmptyArray.make

/**
 * @tsplus fluent ets/Array groupByT
 */
export const groupByT_ = ROArray.groupByT_

/**
 * @tsplus fluent Chunk groupByT
 */
export function groupByTChunk_<A, Key extends PropertyKey>(c: Chunk<A>, f: (a: A) => Key) {
  return c.toArray.groupByT(f).toChunk
}

/**
 * @tsplus operator ets/Array &
 * @tsplus fluent ets/Array concat
 */
export function concat_<A, B>(
  self: ROArray<A>,
  that: ROArray<B>
): ROArray<A | B> {
  return ROArray.concat_(self, that)
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
  return ROArray.prepend_(self, a)
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

/**
 * @tsplus fluent ets/Array filterWith
 */
export function filterWith<A>(self: ROArray<A>, predicates: ROArray<Predicate<A>>) {
  return self.filterRA(_ => predicates.every(f => f(_)))
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
 * @tsplus fluent ets/Array chunk
 * @tsplus fluent Chunk chunk
 * @tsplus fluent Collection chunk
 */
export function chunk_<T>(items_: Iterable<T>, size: number) {
  return Chunk.from(_chunk_(items_, size))
}

/**
 * @tsplus getter ets/Array toChunk
 * @tsplus getter Collection toChunk
 */
export function toChunk<T>(items: Iterable<T>) {
  return Chunk.from(items)
}

/**
 * @tsplus getter ets/Array toNonEmpty
 */
export const toNonEmptyArray = flow(NonEmptyArray.fromArray, _ => _.toMaybe)

/**
 * @tsplus getter Collection toNonEmptyArray
 */
export function CollectionToNonEmptyArray<A>(c: Collection<A>) {
  return c.toArray.toNonEmpty
}

/**
 * @tsplus getter Chunk toNonEmptyArray
 */
export function ChunkToNonEmptyArray<A>(c: Chunk<A>) {
  return c.toArray.toNonEmpty
}

/**
 * @tsplus fluent ets/Array forEachEffectPar
 */
export function ext_forEachEffectPar<A, R, E, B>(
  as: ReadonlyArray<A>,
  f: (a: A) => Effect<R, E, B>
) {
  return Effect.forEachPar(as, f)
}

/**
 * @tsplus fluent Chunk forEachEffectPar
 */
export function ext_CNKforEachEffectPar<A, R, E, B>(
  as: Chunk<A>,
  f: (a: A) => Effect<R, E, B>
) {
  return Effect.forEachPar(as, f)
}

/**
 * @tsplus fluent ets/NonEmptyArray forEachEffectPar
 */
export function ext_NAforEachEffectPar<A, R, E, B>(
  as: NonEmptyArray<A>,
  f: (a: A) => Effect<R, E, B>
) {
  return Effect.forEachPar(as, f).map(_ => _.toNonEmptyArray.value!)
}

/**
 * @tsplus fluent ets/NonEmptyArray forEachEffect
 */
export function ext_NAforEach<A, R, E, B>(as: NonEmptyArray<A>, f: (a: A) => Effect<R, E, B>) {
  return Effect.forEach(as, f).map(_ => _.toNonEmptyArray.value!)
}

/**
 * @tsplus fluent ets/NonEmptyArray forEachEffectWithIndexPar
 */
export function ext_NAforEachEffectWithIndexPar<A, R, E, B>(
  as: NonEmptyArray<A>,
  f: (a: A, i: number) => Effect<R, E, B>
) {
  return Effect.forEachParWithIndex(as, f).map(_ => _.toNonEmptyArray.value!)
}

/**
 * @tsplus fluent ets/NonEmptyArray forEachEffectWithIndex
 */
export function ext_NAforEachWithIndex<A, R, E, B>(as: NonEmptyArray<A>, f: (a: A, i: number) => Effect<R, E, B>) {
  return Effect.forEachWithIndex(as, f).map(_ => _.toNonEmptyArray.value!)
}

/**
 * @tsplus fluent ets/Array forEachEffectWithIndex
 * @tsplus fluent Chunk forEachEffectWithIndex
 * @tsplus fluent Chunk forEachEffectWithIndex
 * @tsplus fluent ets/Set forEachEffectWithIndex
 */
export function ext_forEachWithIndex<A, R, E, B>(as: Iterable<A>, f: (a: A, i: number) => Effect<R, E, B>) {
  return Effect.forEachWithIndex(as, f)
}

/**
 * @tsplus fluent ets/Array forEachEffectParWithIndex
 * @tsplus fluent Chunk forEachEffectParWithIndex
 * @tsplus fluent Chunk forEachEffectParWithIndex
 * @tsplus fluent ets/Set forEachEffectParWithIndex
 */
export function ext_forEachParWithIndex<A, R, E, B>(as: Iterable<A>, f: (a: A, i: number) => Effect<R, E, B>) {
  return Effect.forEachParWithIndex(as, f)
}

/**
 * @tsplus getter Iterable toArray
 * @tsplus getter Iterator toArray
 * @tsplus getter Generator toArray
 */
export const ext_itToArray = ROArray.from

/**
 * @tsplus getter Iterable toChunk
 * @tsplus getter Iterator toChunk
 * @tsplus getter Generator toChunk
 */
export const ext_itToChunk = Chunk.from
