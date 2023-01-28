// TODO: Add effect cause/exit etc

import type { Effect, EffectTypeId } from "@effect/io/Effect"
import type { Chunk, Either, Option } from "./Prelude.js"

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
 * @tsplus unify fp-ts/core/Either
 * @tsplus unify fp-ts/core/Either.Left
 * @tsplus unify fp-ts/core/Either.Right
 */
export function unifyEither<X extends Either<any, any>>(
  self: X
): Either<
  X extends Either.Left<infer EX> ? EX : never,
  X extends Either.Right<infer AX> ? AX : never
> {
  return self
}

/**
 * @tsplus unify fp-ts/core/Option
 * @tsplus unify fp-ts/core/Option.Some
 * @tsplus unify fp-ts/core/Option.None
 */
export function unifyOption<X extends Option<any>>(
  self: X
): Option<X extends Option.Some<infer A> ? A : never> {
  return self
}
