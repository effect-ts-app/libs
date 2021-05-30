import * as A from "@effect-ts/core/Collections/Immutable/Array"
import * as NA from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import { flow, identity, Predicate } from "@effect-ts/core/Function"
import * as O from "@effect-ts/core/Option"
import { Ord } from "@effect-ts/core/Ord"

export const findIndexOrElse_ = flow(
  A.findIndex_,
  O.getOrElse(() => -1)
)

export function findIndexOrElse<A>(predicate: Predicate<A>): (as: Array<A>) => number {
  return (as) => findIndexOrElse_(as, predicate)
}

export function modifyAtOrOriginal_<A>(as: A.Array<A>, i: number, f: (a: A) => A) {
  return A.modifyAt_(as, i, f)["|>"](O.getOrElse(() => as))
}

export function modifyOrOriginal_<A>(as: A.Array<A>, a: A, f: (a: A) => A) {
  return modifyAtOrOriginal_(
    as,
    findIndexOrElse_(as, (x) => x === a),
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
  return A.deleteAt_(as, i)["|>"](O.getOrElse(() => as))
}

export function deleteOrOriginal_<A>(as: A.Array<A>, a: A) {
  return deleteAtOrOriginal_(
    as,
    findIndexOrElse_(as, (x) => x === a)
  )
}

export function deleteAtOrOriginal<A>(i: number) {
  return (as: A.Array<A>) => deleteAtOrOriginal_(as, i)
}

export function deleteOrOriginal<A>(a: A) {
  return (as: A.Array<A>) => deleteOrOriginal_(as, a)
}

export function sortByO<A>(
  ords: O.Option<NA.NonEmptyArray<Ord<A>>>
): (a: A.Array<A>) => A.Array<A> {
  return ords["|>"](O.fold(() => identity, A.sortBy))
}

export * from "@effect-ts/core/Collections/Immutable/Array"
