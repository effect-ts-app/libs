// TODO: Add effect cause/exit etc

import type { Effect, EffectTypeId } from "effect/Effect"
import type { Chunk, Either, Option } from "./Prelude.js"

/**
 * @tsplus unify effect/io/Effect
 */
export function unifyEffect<X extends { readonly [EffectTypeId]: Effect.VarianceStruct<any, any, any> }>(
  self: X
): Effect<
  [X] extends [{ readonly [EffectTypeId]: { _R: (_: never) => infer R } }] ? R : never,
  [X] extends [{ readonly [EffectTypeId]: { _E: (_: never) => infer E } }] ? E : never,
  [X] extends [{ readonly [EffectTypeId]: { _A: (_: never) => infer A } }] ? A : never
> {
  return self as any
}

/**
 * @tsplus unify effect/data/Chunk
 */
export function unifyChunk<X extends Chunk<any>>(
  self: X
): Chunk<[X] extends [Chunk<infer A>] ? A : never> {
  return self
}

/**
 * @tsplus unify effect/data/Either
 * @tsplus unify effect/data/Either.Left
 * @tsplus unify effect/data/Either.Right
 */
export function unifyEither<X extends Either<any, any>>(
  self: X
): Either<
  X extends Either.Left<infer EX, any> ? EX : X extends Either.Right<infer EX, any> ? EX : never,
  X extends Either.Right<any, infer AX> ? AX : X extends Either.Left<any, infer AX> ? AX : never
> {
  return self
}

/**
 * @tsplus unify effect/data/Option
 * @tsplus unify effect/data/Option.Some
 * @tsplus unify effect/data/Option.None
 */
export function unifyOption<X extends Option<any>>(
  self: X
): Option<
  X extends Option.Some<infer A> ? A
    : X extends Option.None<infer A> ? A
    : never
> {
  return self
}
