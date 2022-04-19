import * as A from "@effect-ts/core/Collections/Immutable/Array"

import { map_ } from "./Tuple"

export * from "@effect-ts/core/Collections/Immutable/Tuple"

export function flattenArray<T>({ tuple }: Tuple<A.Array<A.Array<T>>>) {
  return A.flatten(tuple)
}

export function map<T, B>(mod: (a: T) => B) {
  return (tup: Tuple<A.Array<T>>) => map_(tup, mod)
}
