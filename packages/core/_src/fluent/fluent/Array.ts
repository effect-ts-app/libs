// ets_tracing: off

import * as E from "@effect-ts/core/Either"

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
  f: (a: A) => Opt<B>
): Opt<ReadonlyArray<B>> {
  const res = [] as B[]
  for (const a of self) {
    const x = f(a)
    if (Opt.isNone(x)) {
      return x
    }
    res.push(x.value)
  }
  return Opt.some(res)
}
