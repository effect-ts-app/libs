import {
  fromArray as fromArray_,
  insert,
  insert_,
  Set,
  toArray,
} from "@effect-ts/core/Collections/Immutable/Set"
import * as Eq from "@effect-ts/core/Equal"

import * as Ord from "./Order"

export function make<A>(ord: Ord.Ord<A>, eq: Eq.Equal<A>) {
  const fromArray = fromArray_(eq)
  const concat_ = (set: Set<A>, it: Iterable<A>) => fromArray([...set, ...it])
  return {
    insert: insert(eq),
    insert_: insert_(eq),
    toArray: toArray(ord),
    fromArray,
    from: (it: Iterable<A>) => fromArray([...it]),
    empty: () => new Set<A>(),
    concat_,
    concat: (it: Iterable<A>) => (set: Set<A>) => concat_(set, it),
  }
  // TODO: extend
}

export * from "@effect-ts/core/Collections/Immutable/Set"
