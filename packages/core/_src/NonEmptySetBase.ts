import * as Eq from "@effect-ts/core/Equal"

import { flow } from "./Function.js"
import * as Maybe from "./Maybe.js"
import { NonEmptyArray } from "./NonEmptyArray.js"
import * as Ord from "./Order.js"
import {
  filter_,
  filterMap,
  filterMap_,
  fromArray as fromArrayOriginal,
  insert as insertOriginal,
  insert_ as insert_Original,
  map,
  map_,
  reduce,
  reduce_,
  remove,
  remove_,
  Set,
  toArray as toArrayOriginal,
} from "./Set.js"

export interface NonEmptyBrand {
  readonly NonEmpty: unique symbol
}

/**
 * @tsplus type ets/NESet
 */
export type NonEmptySet<A> = Set<A> & NonEmptyBrand

function make_<A>(ord: Ord.Ord<A>, eq: Eq.Equal<A>) {
  const fromArray_ = fromArrayOriginal(eq)
  const fromArray = flow(fromArray_, fromSet)
  const fromNonEmptyArray = (arr: NonEmptyArray<A>) => fromArray_(arr) as NonEmptySet<A>
  const concat_ = (set: NonEmptySet<A>, it: Iterable<A>) => fromArray([...set, ...it])
  const insert__ = insertOriginal(eq)
  const insert: (a: A) => (set: NonEmptySet<A>) => NonEmptySet<A> = insert__ as any
  const insert_: (set: NonEmptySet<A>, a: A) => NonEmptySet<A> = insert_Original as any

  function replace_(set: NonEmptySet<A>, a: A) {
    return (filter_(set, (x) => !eq.equals(x, a)) >= insert__(a)) as NonEmptySet<A>
  }

  const toArray__ = toArrayOriginal(ord)

  function toArray(s: NonEmptySet<A>) {
    return toArray__(s) as NonEmptyArray<A>
  }

  const remove__ = remove(eq)
  const filterMap__ = filterMap(eq)

  return {
    insert,
    insert_,
    remove: (a: A) => flow(remove__(a), fromSet),
    remove_: flow(remove_(eq), fromSet),
    reduce: reduce(ord),
    reduce_: reduce_(ord),
    replace: (a: A) => (set: NonEmptySet<A>) => replace_(set, a),
    replace_,
    toArray,
    fromArray,
    fromNonEmptyArray,
    from: (it: Iterable<A>) => fromArray([...it]),
    of: (a: A) => new Set<A>([a]) as unknown as NonEmptySet<A>,
    concat_,
    concat: (it: Iterable<A>) => (set: NonEmptySet<A>) => concat_(set, it),

    // A and B the same, useful when editing elements.
    map: map(eq) as unknown as <A>(
      f: (x: A) => A
    ) => (set: NonEmptySet<A>) => NonEmptySet<A>,
    map_: map_(eq) as unknown as <A>(
      set: NonEmptySet<A>,
      f: (x: A) => A
    ) => NonEmptySet<A>,
    filterMap: (f: (a: A) => Maybe.Maybe<A>) => flow(filterMap__(f), fromSet),
    filterMap_: flow(filterMap_(eq), fromSet),
  }
  // TODO: extend
}

class Wrapper<A> {
  wrapped(ord: Ord.Ord<A>, eq: Eq.Equal<A>) {
    return make_(ord, eq)
  }
}

export interface NonEmptySetSchemaExtensions<A>
  extends ReturnType<Wrapper<A>["wrapped"]> {}

export const make: <A>(
  ord: Ord.Ord<A>,
  eq: Eq.Equal<A>
) => NonEmptySetSchemaExtensions<A> = make_

export function fromSet<A>(set: Set<A>) {
  if (set.size > 0) {
    return Maybe.some(set as NonEmptySet<A>)
  } else {
    return Maybe.none
  }
}

// TODO
export * from "@effect-ts/core/Collections/Immutable/Set"
