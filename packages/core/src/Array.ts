import * as Array from "effect/Array"
import * as T from "effect/Effect"
import type { Predicate } from "./Function.js"
import { dual, identity, tuple } from "./Function.js"
import * as Option from "./Option.js"
import type { NonEmptyArray, NonEmptyReadonlyArray, Order } from "./Prelude.js"
import { Chunk, Effect } from "./Prelude.js"

/**
 * @tsplus getter ReadonlyArray toNonEmpty
 * @tsplus getter Array toNonEmpty
 * @tsplus getter effect/data/ReadonlyArray toNonEmpty
 */
export const toNonEmptyArray = <A>(a: ReadonlyArray<A>): Option.Option<NonEmptyReadonlyArray<A>> =>
  a.length ? Option.some(a as NonEmptyReadonlyArray<A>) : Option.none()

export const isArray: {
  // uses ReadonlyArray here because otherwise the second overload don't work when ROA is involved.
  (self: unknown): self is ReadonlyArray<unknown>
  <T>(self: T): self is Extract<T, ReadonlyArray<any>>
} = Array.isArray

/**
 * @tsplus static effect/data/ReadonlyArray/NonEmptyArray.Ops fromArray
 */
export function NEAFromArray<T>(ar: Array<T>) {
  return ar.length ? Option.some(ar as NonEmptyArray<T>) : Option.none()
}

/**
 * @tsplus static effect/data/ReadonlyArray/NonEmptyArray.Ops fromArray
 */
export function NEROArrayFromArray<T>(ar: ReadonlyArray<T>) {
  return ar.length ? Option.some(ar as NonEmptyReadonlyArray<T>) : Option.none()
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
  return Option.match(ords, { onNone: () => identity, onSome: (_) => Array.sortBy(..._) })
}

/**
 * @tsplus fluent ReadonlyArray groupByT
 * @tsplus fluent Array groupByT
 * @tsplus fluent NonEmptyArray groupByT
 * @tsplus fluent NonEmptyArrayReadonlyArray groupByT
 */
export const groupByT = dual<
  <A, Key extends PropertyKey>(
    f: (a: NoInfer<A>) => Key
  ) => (as: ReadonlyArray<A>) => ReadonlyArray<readonly [Key, NonEmptyReadonlyArray<A>]>,
  <A, Key extends PropertyKey>(
    as: ReadonlyArray<A>,
    f: (a: A) => Key
  ) => ReadonlyArray<readonly [Key, NonEmptyReadonlyArray<A>]>
>(2, <A, Key extends PropertyKey>(
  as: ReadonlyArray<A>,
  f: (a: A) => Key
): ReadonlyArray<readonly [Key, NonEmptyReadonlyArray<A>]> => {
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
})

// A getter would be nice, but we need it fluent to manage the priority vs nonEmpty etc
/**
 * @tsplus fluent ReadonlyArray randomElement 2
 */
export function randomElement<A>(a: NonEmptyReadonlyArray<A>): A
export function randomElement<A>(a: ReadonlyArray<A>): A | undefined
export function randomElement<A>(a: ReadonlyArray<A>): A | undefined {
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
 * @tsplus fluent effect/data/ReadonlyArray/NonEmptyReadonlyArray forEachEffect
 */
export function forEachEffectNA<A, R, E, B>(as: NonEmptyReadonlyArray<A>, f: (a: A) => Effect<B, E, R>) {
  return Effect.map(T.forEach(as, f), (_) => Option.getOrNull(toNonEmptyArray(_)))
}

export * from "effect/Array"
