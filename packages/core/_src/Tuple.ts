import { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"

export * from "@effect-ts/core/Collections/Immutable/Tuple"

export function flattenArray<T>({ tuple }: Tuple<ROArray<ROArray<T>>>): ROArray<T> {
  return ROArray.flatten(tuple)
}

export function map_<T, B>({ tuple }: Tuple<ROArray<T>>, mod: (a: T) => B) {
  return ROArray.map_(tuple, mod)
}

export function map<T, B>(mod: (a: T) => B) {
  return (tup: Tuple<ROArray<T>>) => map_(tup, mod)
}
