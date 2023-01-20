import { sort, sortBy, uniq } from "@effect-ts/core/Collections/Immutable/Array"
import type * as Ord from "@effect-ts/core/Ord"

export function mapOriginal_<AX, B>(
  a: ReadonlyArray<AX>,
  f: (a: AX, i: number) => B
): ReadonlyArray<B> {
  return a.map(f)
}

export function sort_<A>(a: ReadonlyArray<A>, O: Ord.Ord<A>) {
  return sort(O)(a)
}

export function sortBy_<A>(a: ReadonlyArray<A>, ords: ReadonlyArray<Ord.Ord<A>>) {
  return sortBy(ords)(a)
}

export function uniq_<A>(as: ReadonlyArray<A>, E: Equivalence<A>) {
  return uniq<A>({ equals: (x, y) => E(y)(x) })(as)
}
