import {
  filter_,
  filterMap,
  filterMap_,
  fromArray as fromArray_,
  insert as insertOriginal,
  insert_,
  map,
  map_,
  reduce,
  reduce_,
  remove,
  remove_,
  Set,
  toArray,
} from "@effect-ts/core/Collections/Immutable/Set"
import * as Eq from "@effect-ts/core/Equal"

import * as Ord from "./Order.js"

function make_<A>(ord: Ord.Ord<A>, eq: Eq.Equal<A>) {
  const fromArray = fromArray_(eq)
  const concat_ = (set: Set<A>, it: Iterable<A>) => fromArray([...set, ...it])
  const insert = insertOriginal(eq)

  function replace_(set: Set<A>, a: A) {
    return filter_(set, (x) => !eq.equals(x, a)) >= insert(a)
  }

  return {
    insert,
    insert_: insert_(eq),
    remove: remove(eq),
    remove_: remove_(eq),
    reduce: reduce(ord),
    reduce_: reduce_(ord),
    replace: (a: A) => (set: Set<A>) => replace_(set, a),
    replace_,
    toArray: toArray(ord),
    fromArray,
    from: (it: Iterable<A>) => fromArray([...it]),
    empty: () => new Set<A>(),
    concat_,
    concat: (it: Iterable<A>) => (set: Set<A>) => concat_(set, it),

    // A and B the same, useful when editing elements.
    map: map(eq),
    map_: map_(eq),
    filterMap: filterMap(eq),
    filterMap_: filterMap_(eq),
  }
  // TODO: extend
}

class Wrapper<A> {
  wrapped(ord: Ord.Ord<A>, eq: Eq.Equal<A>) {
    return make_(ord, eq)
  }
}

export interface SetSchemaExtensions<A> extends ReturnType<Wrapper<A>["wrapped"]> {}

export const make: <A>(ord: Ord.Ord<A>, eq: Eq.Equal<A>) => SetSchemaExtensions<A> =
  make_

export * from "@effect-ts/core/Collections/Immutable/Set"
