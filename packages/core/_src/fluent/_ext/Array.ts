import { sort, sortBy, uniq } from "@effect-ts/core/Collections/Immutable/Array"
import type * as Eq from "@effect-ts/core/Equal"
import type * as Ord from "@effect-ts/core/Ord"

export function mapOriginal_<AX, B>(
  a: ROArray<AX>,
  f: (a: AX, i: number) => B
): ROArray<B> {
  return a.map(f)
}

export function sort_<A>(a: ROArray<A>, O: Ord.Ord<A>) {
  return sort(O)(a)
}

export function sortBy_<A>(a: ROArray<A>, ords: ROArray<Ord.Ord<A>>) {
  return sortBy(ords)(a)
}

export function uniq_<A>(as: ROArray<A>, E: Eq.Equal<A>) {
  return uniq(E)(as)
}
