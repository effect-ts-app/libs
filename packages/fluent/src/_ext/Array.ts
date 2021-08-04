import type * as Eq from "@effect-ts/core/Equal"
import type * as Ord from "@effect-ts/core/Ord"
import type { Array } from "@effect-ts-app/core/Array"
import { sort, sortBy, uniq } from "@effect-ts-app/core/Array"

export function mapOriginal_<AX, B>(
  a: Array<AX>,
  f: (a: AX, i: number) => B
): Array<B> {
  return a.map(f)
}

export function sort_<A>(a: Array<A>, O: Ord.Ord<A>) {
  return sort(O)(a)
}

export function sortBy_<A>(a: Array<A>, ords: Array<Ord.Ord<A>>) {
  return sortBy(ords)(a)
}

export function uniq_<A>(as: Array<A>, E: Eq.Equal<A>) {
  return uniq(E)(as)
}
