import * as A from "@effect-ts/core/Collections/Immutable/Array"
import { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"

export * from "@effect-ts/core/Collections/Immutable/Tuple"

export function map_<T, B>({ tuple }: Tuple<A.Array<T>>, mod: (a: T) => B) {
  return A.map_(tuple, mod)
}

export * as $ from "./TupleAspects.js"
