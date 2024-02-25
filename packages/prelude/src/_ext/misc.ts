import { Effect, Either, Option, type Scope } from "@effect-app/core"
import type { LazyArg } from "@effect-app/core/Function"
import type { ClientRequest } from "@effect/platform/Http/ClientRequest"
import type { HttpClient, HttpClientRequest } from "../http.js"

export type _R<T extends Effect<any, any, any>> = [T] extends [
  Effect<any, any, infer R>
] ? R
  : never

export type _E<T extends Effect<any, any, any>> = [T] extends [
  Effect<any, infer E, any>
] ? E
  : never

/**
 * @tsplus fluent effect/data/Option encaseInEffect
 */
export function encaseMaybeInEffect_<E, A>(
  o: Option<A>,
  onError: LazyArg<E>
): Effect<A, E> {
  return o.match({ onNone: () => Effect.fail(onError()), onSome: Effect.succeed })
}

/**
 * @tsplus fluent effect/data/Option encaseInEither
 */
export function encaseMaybeEither_<E, A>(
  o: Option<A>,
  onError: LazyArg<E>
): Either.Either<A, E> {
  return o.match({ onNone: () => Either.left(onError()), onSome: Either.right })
}

/**
 * @tsplus getter effect/io/Effect toNullable
 */
export function toNullable<R, E, A>(
  self: Effect<Option<A>, E, R>
) {
  return Effect.map(self, (_) => Option.getOrNull(_))
}

/**
 * @tsplus fluent effect/io/Effect scope
 */
export function scope<R, E, A, R2, E2, A2>(
  scopedEffect: Effect<A, E, R | Scope>,
  effect: Effect<A2, E2, R2>
): Effect<A2, E | E2, Exclude<R | R2, Scope>> {
  return scopedEffect.zipRight(effect).scoped
}

/**
 * @tsplus fluent effect/io/Effect flatMapScoped
 */
export function flatMapScoped<R, E, A, R2, E2, A2>(
  scopedEffect: Effect<A, E, R | Scope>,
  effect: (a: A) => Effect<A2, E2, R2>
): Effect<A2, E | E2, Exclude<R | R2, Scope>> {
  return scopedEffect.flatMap(effect).scoped
}

// /**
//  * @tsplus fluent effect/io/Effect withScoped
//  */
// export function withScoped<R, E, A, R2, E2, A2>(
//   effect: Effect<R2, E2, A2>,
//   scopedEffect: Effect<R | Scope, E, A>
// ): Effect<Exclude<R | R2, Scope>, E | E2, A2> {
//   return scopedEffect.zipRight(effect).scoped
// }

// /**
//  * @tsplus fluent effect/io/Effect withScoped
//  */
// export function withScopedFlatMap<R, E, A, R2, E2, A2>(
//   effect: (a: A) => Effect<R2, E2, A2>,
//   scopedEffect: Effect<R | Scope, E, A>
// ): Effect<Exclude<R | R2, Scope>, E | E2, A2> {
//   return scopedEffect.flatMap(effect).scoped
// }

/** @tsplus fluent effect/platform/Http/Client request */
export const client: {
  <A, B, C, R, E>(
    client: HttpClient.Client<A, B, C>,
    req: Effect<HttpClientRequest.ClientRequest, E, R>
  ): Effect<C, B | E, A | R>
  <A, B, C>(client: HttpClient.Client<A, B, C>, req: ClientRequest): Effect<C, B, A>
} = (
  client: HttpClient.Client<any, any, any>,
  req: Effect<HttpClientRequest.ClientRequest, any, any> | HttpClientRequest.ClientRequest
) =>
  Effect.isEffect(req)
    ? req.flatMap(client)
    : client(req)
