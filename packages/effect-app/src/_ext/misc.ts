import { Effect, Either, Option, type Scope } from "effect"
import type { LazyArg } from "effect-app/Function"

export type _R<T extends Effect.Effect<any, any, any>> = [T] extends [
  Effect.Effect<any, any, infer R>
] ? R
  : never

export type _E<T extends Effect.Effect<any, any, any>> = [T] extends [
  Effect.Effect<any, infer E, any>
] ? E
  : never

/**
 * @tsplus fluent effect/data/Option encaseInEffect
 */
export function encaseMaybeInEffect_<E, A>(
  o: Option.Option<A>,
  onError: LazyArg<E>
): Effect.Effect<A, E> {
  return Option.match(o, { onNone: () => Effect.fail(onError()), onSome: Effect.succeed })
}

/**
 * @tsplus fluent effect/data/Option encaseInEither
 */
export function encaseMaybeEither_<E, A>(
  o: Option.Option<A>,
  onError: LazyArg<E>
): Either.Either<A, E> {
  return Option.match(o, { onNone: () => Either.left(onError()), onSome: Either.right })
}

/**
 * @tsplus getter effect/io/Effect toNullable
 */
export function toNullable<R, E, A>(
  self: Effect.Effect<Option.Option<A>, E, R>
) {
  return Effect.map(self, (_) => Option.getOrNull(_))
}

/**
 * @tsplus fluent effect/io/Effect scope
 */
export function scope<R, E, A, R2, E2, A2>(
  scopedEffect: Effect.Effect<A, E, R | Scope.Scope>,
  effect: Effect.Effect<A2, E2, R2>
): Effect.Effect<A2, E | E2, Exclude<R | R2, Scope.Scope>> {
  return Effect.zipRight(scopedEffect, effect).pipe(Effect.scoped)
}

/**
 * @tsplus fluent effect/io/Effect flatMapScoped
 */
export function flatMapScoped<R, E, A, R2, E2, A2>(
  scopedEffect: Effect.Effect<A, E, R | Scope.Scope>,
  effect: (a: A) => Effect.Effect<A2, E2, R2>
): Effect.Effect<A2, E | E2, Exclude<R | R2, Scope.Scope>> {
  return scopedEffect.pipe(Effect.flatMap(effect), Effect.scoped)
}

// /**
//  * @tsplus fluent effect/io/Effect withScoped
//  */
// export function withScoped<R, E, A, R2, E2, A2>(
//   effect: Effect.Effect<R2, E2, A2>,
//   scopedEffect: Effect.Effect<R | Scope.Scope, E, A>
// ): Effect.Effect<Exclude<R | R2, Scope.Scope>, E | E2, A2> {
//   return scopedEffect.zipRight(effect).scoped
// }

// /**
//  * @tsplus fluent effect/io/Effect withScoped
//  */
// export function withScopedFlatMap<R, E, A, R2, E2, A2>(
//   effect: (a: A) => Effect.Effect<R2, E2, A2>,
//   scopedEffect: Effect.Effect<R | Scope.Scope, E, A>
// ): Effect.Effect<Exclude<R | R2, Scope.Scope>, E | E2, A2> {
//   return scopedEffect.flatMap(effect).scoped
// }
