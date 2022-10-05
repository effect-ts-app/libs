import * as A from "@effect-ts/core/Collections/Immutable/Array"
import { Tuple, TupleSym } from "@effect-ts/core/Collections/Immutable/Tuple"

export * from "@effect-ts/core/Collections/Immutable/Tuple"

export function map_<T, B>({ tuple }: Tuple<A.Array<T>>, mod: (a: T) => B) {
  return A.map_(tuple, mod)
}

// added readonly or it won't work with readonly types
export function isTuple(self: unknown): self is Tuple<readonly unknown[]> {
  return typeof self === "object" && self != null && TupleSym in self
}
