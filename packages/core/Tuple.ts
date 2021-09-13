import * as A from "@effect-ts/core/Collections/Immutable/Array"
import { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"

export * from "@effect-ts/core/Collections/Immutable/Tuple"

export function flattenArray<T>({ tuple }: Tuple<A.Array<A.Array<T>>>) {
  return A.flatten(tuple)
}

export function map_<T, B>({ tuple }: Tuple<A.Array<T>>, mod: (a: T) => B) {
  return A.map_(tuple, mod)
}

export function map<T, B>(mod: (a: T) => B) {
  return (tup: Tuple<A.Array<T>>) => map_(tup, mod)
}
