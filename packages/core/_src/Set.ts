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
  toArray
} from "@effect-ts/core/Collections/Immutable/Set"

function make_<A>(ord: Ord<A>, eq_?: Equal<A>) {
  const eq = eq_ ?? <Equal<A>> { equals: (x, y) => ord.compare(x, y) === 0 }

  const fromArray = fromArray_(eq)
  const concat_ = (set: Set<A>, it: Iterable<A>) => fromArray([...set, ...it])
  const insert = insertOriginal(eq)

  function replace_(set: Set<A>, a: A) {
    return filter_(set, x => !eq.equals(x, a)) >= insert(a)
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
    filterMap_: filterMap_(eq)
  }
  // TODO: extend
}

class Wrapper<A> {
  wrapped(ord: Ord<A>, eq: Equal<A>) {
    return make_(ord, eq)
  }
}

export interface SetSchemaExtensions<A> extends ReturnType<Wrapper<A>["wrapped"]> {}

export const make: <A>(
  ord: Ord<A>,
  eq?: Equal<A>
) => SetSchemaExtensions<A> = make_

export * from "@effect-ts/core/Collections/Immutable/Set"
