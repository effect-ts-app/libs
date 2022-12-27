import type { Ord } from "@effect-ts/core/Ord"
import { tuple } from "@effect-ts/core/Ord"
import { identity } from "./Function.js"

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
 * @tsplus pipeable ReadonlyArray sortByO
 * @tsplus pipeable NonEmptyArray sortByO
 * @tsplus pipeable NonEmptyArrayReadonlyArray sortByO
 */
export function sortByO<A>(
  ords: Opt<NonEmptyReadonlyArray<Ord<A>>>
): (a: ReadonlyArray<A>) => ReadonlyArray<A> {
  return ords.match(() => identity, ROArray.sortBy)
}

/**
 * @tsplus pipeable ReadonlyArray groupByT
 * @tsplus pipeable NonEmptyArray groupByT
 * @tsplus pipeable NonEmptyArrayReadonlyArray groupByT
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
