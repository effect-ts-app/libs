import * as Eq from "@effect-ts/core/Equal"
import * as Ord from "@effect-ts/core/Ord"
import * as A from "@effect-ts-app/core/Array"

export function sort_<A>(a: A.Array<A>, O: Ord.Ord<A>) {
  return A.sort(O)(a)
}

export function sortBy_<A>(a: A.Array<A>, ords: A.Array<Ord.Ord<A>>) {
  return A.sortBy(ords)(a)
}

export function uniq_<A>(as: Array<A>, E: Eq.Equal<A>) {
  return A.uniq(E)(as)
}

export * from "@effect-ts-app/core/Array"
