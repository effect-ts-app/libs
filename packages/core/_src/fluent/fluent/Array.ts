// ets_tracing: off

import * as Arr from "@effect-ts/core/Collections/Immutable/Array"
import * as E from "@effect-ts/core/Either"

import * as O from "../../Maybe.js"

export function mapEither_<E, A, B>(
  self: Arr.Array<A>,
  f: (a: A) => E.Either<E, B>
): E.Either<E, Arr.Array<B>> {
  const res = [] as B[]
  for (const a of self) {
    const x = f(a)
    if (E.isLeft(x)) {
      return x
    }
    res.push(x.right)
  }
  return E.right(res)
}

export function mapMaybe_<A, B>(
  self: Arr.Array<A>,
  f: (a: A) => O.Maybe<B>
): O.Maybe<Arr.Array<B>> {
  const res = [] as B[]
  for (const a of self) {
    const x = f(a)
    if (O.isNone(x)) {
      return x
    }
    res.push(x.value)
  }
  return O.some(res)
}
