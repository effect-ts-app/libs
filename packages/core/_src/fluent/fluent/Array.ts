// ets_tracing: off

import * as E from "@effect-ts/core/Either"
import type { Option } from "../../Prelude.js"

export function mapEither_<E, A, B>(
  self: ReadonlyArray<A>,
  f: (a: A) => E.Either<E, B>
): E.Either<E, ReadonlyArray<B>> {
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

export function mapOpt_<A, B>(
  self: ReadonlyArray<A>,
  f: (a: A) => Option<B>
): Option<ReadonlyArray<B>> {
  const res = [] as B[]
  for (const a of self) {
    const x = f(a)
    if (x.isNone()) {
      return x
    }
    res.push(x.value)
  }
  return Opt.some(res)
}

/**
 * @tsplus fluent fp-ts/data/ReadonlyArray toChunk
 * @tsplus fluent ReadonlyArray toChunk
 */
export function toChunk<T>(self: ReadonlyArray<T>) {
  return Chunk.fromIterable(self)
}
