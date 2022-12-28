// TODO: Add effect cause/exit etc

import type { EffectTypeId } from "@effect/io/Effect"

/**
 * @tsplus unify effect/io/Effect
 */
export function unifyEffect<X extends Effect<any, any, any>>(
  self: X
): Effect<
  [X] extends [{ readonly [EffectTypeId]: { _R: (_: never) => infer R } }] ? R : never,
  [X] extends [{ readonly [EffectTypeId]: { _E: (_: never) => infer E } }] ? E : never,
  [X] extends [{ readonly [EffectTypeId]: { _A: (_: never) => infer A } }] ? A : never
> {
  return self
}

/**
 * @tsplus unify fp-ts/data/Chunk
 */
export function unifyChunk<X extends Chunk<any>>(
  self: X
): Chunk<[X] extends [Chunk<infer A>] ? A : never> {
  return self
}

/**
 * @tsplus unify fp-ts/data/Either
 * @tsplus unify fp-ts/data/Either.Left
 * @tsplus unify fp-ts/data/Either.Right
 */
export function unifyEither<X extends Either<any, any>>(
  self: X
): Either<
  X extends Left<infer EX> ? EX : never,
  X extends Right<infer AX> ? AX : never
> {
  return self
}

/**
 * @tsplus unify fp-ts/data/Opt
 * @tsplus unify fp-ts/data/Opt.Some
 * @tsplus unify fp-ts/data/Opt.None
 */
export function unifyOpt<X extends Opt<any>>(
  self: X
): Opt<X extends Some<infer A> ? A : never> {
  return self
}
