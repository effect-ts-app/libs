import type * as NA from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import type { Predicate } from "@effect-ts/core/Function"
import { flow, identity, tuple } from "@effect-ts/core/Function"
import type { Ord } from "@effect-ts/core/Ord"
import * as A from "./Array.js"

import * as O from "./Option.js"

export const flatMap = A.chain
export const flatMap_ = A.chain_

export const { isArray } = Array

export const findIndexOrElse_ = flow(
  A.findIndex_,
  O.getOrElse(() => -1)
)

export function findIndexOrElse<A>(
  predicate: Predicate<A>
): (as: Array<A>) => number {
  return as => findIndexOrElse_(as, predicate)
}

export function modifyAtOrOriginal_<A>(
  as: A.Array<A>,
  i: number,
  f: (a: A) => A
) {
  return A.modifyAt_(as, i, f).toMaybe.getOrElse(() => as)
}

export function modifyOrOriginal_<A>(as: A.Array<A>, a: A, f: (a: A) => A) {
  return modifyAtOrOriginal_(
    as,
    findIndexOrElse_(as, x => x === a),
    f
  )
}

export function modifyAtOrOriginal<A>(i: number, f: (a: A) => A) {
  return (as: A.Array<A>) => modifyAtOrOriginal_(as, i, f)
}

export function modifyOrOriginal<A>(a: A, f: (a: A) => A) {
  return (as: A.Array<A>) => modifyOrOriginal_(as, a, f)
}

export function deleteAtOrOriginal_<A>(as: A.Array<A>, i: number) {
  return A.deleteAt_(as, i).toMaybe.getOrElse(() => as)
}

export function deleteOrOriginal_<A>(as: A.Array<A>, a: A) {
  return deleteAtOrOriginal_(
    as,
    findIndexOrElse_(as, x => x === a)
  )
}

export function deleteAtOrOriginal<A>(i: number) {
  return (as: A.Array<A>) => deleteAtOrOriginal_(as, i)
}

export function deleteOrOriginal<A>(a: A) {
  return (as: A.Array<A>) => deleteOrOriginal_(as, a)
}

export function sortByO<A>(
  ords: O.Maybe<NA.NonEmptyArray<Ord<A>>>
): (a: A.Array<A>) => A.Array<A> {
  return ords.toMaybe.fold(() => identity, A.sortBy)
}

export function groupByT_<A, Key extends PropertyKey>(
  as: A.Array<A>,
  f: (a: A) => Key
): A.Array<readonly [Key, NA.NonEmptyArray<A>]> {
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
  return Object.entries(r).map(([k, items]) => tuple(k as unknown as Key, items as NA.NonEmptyArray<A>))
}

export function groupByT<A, Key extends PropertyKey>(f: (a: A) => Key) {
  return (as: A.Array<A>): A.Array<readonly [Key, NA.NonEmptyArray<A>]> => groupByT_(as, f)
}

export * from "@effect-ts/core/Collections/Immutable/Array"
