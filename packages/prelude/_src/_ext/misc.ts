import type { Option } from "@effect/data/Option"

export type _R<T extends Effect<any, any, any>> = [T] extends [
  Effect<infer R, any, any>
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
): Effect<never, E, A> {
  return o.match(() => Effect.fail(onError()), Effect.succeed)
}

/**
 * @tsplus getter effect/data/Either asEffect
 */
export const EitherasEffect = Effect.fromEither

/**
 * @tsplus fluent effect/data/Option encaseInEither
 */
export function encaseMaybeEither_<E, A>(
  o: Option<A>,
  onError: LazyArg<E>
): Either<E, A> {
  return o.match(() => Either.left(onError()), Either.right)
}

/**
 * @tsplus getter effect/io/Effect toNullable
 */
export function toNullable<R, E, A>(
  self: Effect<R, E, Option<A>>
) {
  return Debug.untraced(() => self.map((_) => _.getOrNull))
}

/**
 * @tsplus fluent effect/io/Effect scope
 */
export function scope<R, E, A, R2, E2, A2>(
  scopedEffect: Effect<R | Scope, E, A>,
  effect: Effect<R2, E2, A2>
): Effect<Exclude<R | R2, Scope>, E | E2, A2> {
  return Debug.untraced(() => scopedEffect.zipRight(effect).scoped)
}

/**
 * @tsplus fluent effect/io/Effect flatMapScoped
 */
export function flatMapScoped<R, E, A, R2, E2, A2>(
  scopedEffect: Effect<R | Scope, E, A>,
  effect: (a: A) => Effect<R2, E2, A2>
): Effect<Exclude<R | R2, Scope>, E | E2, A2> {
  return Debug.untraced(() => scopedEffect.flatMap(effect).scoped)
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

/**
 * Recovers from all errors.
 *
 * @tsplus static effect/io/Effect.Ops catchAllMap
 * @tsplus pipeable effect/io/Effect catchAllMap
 */
export function catchAllMap<E, A2>(f: (e: E) => A2) {
  return <R, A>(self: Effect<R, E, A>): Effect<R, never, A2 | A> =>
    Debug.untraced(() => self.catchAll((err) => Effect(f(err))))
}

/**
 * Annotates each log in this effect with the specified log annotations.
 * @tsplus static effect/io/Effect.Ops logAnnotates
 */
export function logAnnotates(kvps: Record<string, string>) {
  return <R, E, A>(effect: Effect<R, E, A>): Effect<R, E, A> =>
    Debug.untraced(() =>
      FiberRef
        .currentLogAnnotations
        .get
        .flatMap((annotations) =>
          Effect.suspend(() =>
            pipe(
              effect,
              FiberRef.currentLogAnnotations.locally(
                HashMap.fromIterable([...annotations, ...kvps.$$.entries])
              )
            )
          )
        )
    )
}

/**
 * Annotates each log in this scope with the specified log annotation.
 *
 * @tsplus static effect/io/Effect.Ops logAnnotateScoped
 */
export function logAnnotateScoped(key: string, value: string) {
  return Debug.untraced(() =>
    FiberRef
      .currentLogAnnotations
      .get
      .flatMap((annotations) =>
        Effect.suspend(() => FiberRef.currentLogAnnotations.locallyScoped(annotations.set(key, value)))
      )
  )
}

/**
 * Annotates each log in this scope with the specified log annotations.
 *
 * @tsplus static effect/io/Effect.Ops logAnnotatesScoped
 */
export function logAnnotatesScoped(kvps: Record<string, string>) {
  return Debug.untraced(() =>
    FiberRef
      .currentLogAnnotations
      .get
      .flatMap((annotations) =>
        Effect.suspend(() =>
          FiberRef.currentLogAnnotations.locallyScoped(HashMap.fromIterable([...annotations, ...kvps.$$.entries]))
        )
      )
  )
}

/**
 * @tsplus fluent function flow
 */
export function flow<Args extends readonly any[], B, C>(f: (...args: Args) => B, g: (b: B) => C): (...args: Args) => C {
  return (...args) => g(f(...args))
}
