// import "./EffectOpt.ext.js"
import "./builtIn.js"
import "./date.js"
import "./Has.ext.js"
import "./Lens.ext.js"
// import "./Ref.js"
import "./refinements.js"
import "./Schema.ext.js"

export type _R<T extends Effect<any, any, any>> = [T] extends [
  Effect<infer R, any, any>
] ? R
  : never

export type _E<T extends Effect<any, any, any>> = [T] extends [
  Effect<any, infer E, any>
] ? E
  : never

/**
 * @tsplus fluent fp-ts/data/Option encaseInEffect
 */
export function encaseMaybeInEffect_<E, A>(
  o: Opt<A>,
  onError: LazyArg<E>
): Effect<never, E, A> {
  return o.match(() => Effect.fail(onError()), Effect.succeed)
}

/**
 * @tsplus getter fp-ts/data/Either asEffect
 */
export const EitherasEffect = Effect.fromEither

/**
 * @tsplus fluent fp-ts/data/Option encaseInEither
 */
export function encaseMaybeEither_<E, A>(
  o: Opt<A>,
  onError: LazyArg<E>
): Either<E, A> {
  return o.match(() => Either.left(onError()), Either.right)
}

type Service<T> = T extends Tag<infer S> ? S : never
type Values<T> = T extends { [s: string]: infer S } ? Service<S> : never
type Services<T extends Record<string, Tag<any>>> = { [key in keyof T]: Service<T[key]> }

/**
 * @tsplus static effect/io/Effect.Ops servicesWith
 */
export function accessServices_<T extends Record<string, Tag<any>>, A>(
  services: T,
  fn: (services: Services<T>) => A
) {
  return (Effect.struct(
    services.$$.keys.reduce((prev, cur) => {
      prev[cur] = Effect.service(services[cur]!)
      return prev
    }, {} as any)
  ) as any as Effect<Values<T>, never, Services<T>>).map(fn)
}

/**
 * @tsplus static effect/io/Effect.Ops servicesWithEffect
 */
export function accessServicesM_<T extends Record<string, Tag<any>>, R, E, A>(
  services: T,
  fn: (services: Services<T>) => Effect<R, E, A>
) {
  return (Effect.struct(
    services.$$.keys.reduce((prev, cur) => {
      prev[cur] = Effect.service(services[cur]!)
      return prev
    }, {} as any)
  ) as any as Effect<Values<T>, never, Services<T>>).flatMap(fn)
}

export function accessServices<T extends Record<string, Tag<any>>>(services: T) {
  return <A>(fn: (services: Services<T>) => A) =>
    (Effect.struct(
      services.$$.keys.reduce((prev, cur) => {
        prev[cur] = Effect.service(services[cur]!)
        return prev
      }, {} as any)
    ) as any as Effect<Values<T>, never, Services<T>>).map(fn)
}

export function accessServicesM<T extends Record<string, Tag<any>>>(services: T) {
  return <R, E, A>(fn: (services: Services<T>) => Effect<R, E, A>) =>
    (Effect.struct(
      services.$$.keys.reduce((prev, cur) => {
        prev[cur] = Effect.service(services[cur]!)
        return prev
      }, {} as any)
    ) as any as Effect<Values<T>, never, Services<T>>).flatMap(fn)
}

/**
 * @tsplus getter effect/io/Effect toNullable
 */
export function toNullable<R, E, A>(
  self: Effect<R, E, Opt<A>>
) {
  return self.map(_ => _.getOrNull)
}

/**
 * @tsplus fluent effect/io/Effect scope
 */
export function scope<R, E, A, R2, E2, A2>(
  scopedEffect: Effect<R | Scope, E, A>,
  effect: Effect<R2, E2, A2>
): Effect<Exclude<R | R2, Scope>, E | E2, A2> {
  return scopedEffect.zipRight(effect).scoped
}

/**
 * @tsplus fluent effect/io/Effect flatMapScoped
 */
export function flatMapScoped<R, E, A, R2, E2, A2>(
  scopedEffect: Effect<R | Scope, E, A>,
  effect: (a: A) => Effect<R2, E2, A2>
): Effect<Exclude<R | R2, Scope>, E | E2, A2> {
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

/**
 * Recovers from all errors.
 *
 * @tsplus static effect/io/Effect.Aspects catchAllMap
 * @tsplus pipeable effect/io/Effect catchAllMap
 */
export function catchAllMap<E, A2>(f: (e: E) => A2) {
  return <R, A>(self: Effect<R, E, A>): Effect<R, never, A2 | A> => self.catchAll(err => Effect.succeed(f(err)))
}

/**
 * @depracted use `logSpan`
 * @tsplus fluent effect/io/Effect withSpan
 */
export function withSpan<R, E, A>(self: Effect<R, E, A>, label: string) {
  return self.logSpan(label)
}

/**
 * Annotates each log in this effect with the specified log annotations.
 * @tsplus static effect/io/Effect.Ops logAnnotates
 */
export function logAnnotates(kvps: Record<string, string>) {
  return <R, E, A>(effect: Effect<R, E, A>): Effect<R, E, A> =>
    FiberRef.currentLogAnnotations
      .get
      .flatMap(annotations =>
        Effect.suspendSucceed(() =>
          pipe(
            effect,
            FiberRef.locally(
              new Map([...annotations, ...kvps.$$.entries]) as ReadonlyMap<string, string>
            )(FiberRef.currentLogAnnotations)
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
  return FiberRef.currentLogAnnotations
    .get
    .flatMap(annotations =>
      Effect.suspendSucceed(() =>
        FiberRef.currentLogAnnotations.locallyScoped(
          (annotations as Map<string, string>).set(key, value)
        )
      )
    )
}

/**
 * Annotates each log in this scope with the specified log annotations.
 *
 * @tsplus static effect/io/Effect.Ops logAnnotatesScoped
 */
export function logAnnotatesScoped(kvps: Record<string, string>) {
  return FiberRef.currentLogAnnotations
    .get
    .flatMap(annotations =>
      Effect.suspendSucceed(() =>
        FiberRef.currentLogAnnotations.locallyScoped(
          new Map([...annotations, ...kvps.$$.entries])
        )
      )
    )
}

/**
 * @tsplus fluent function flow
 */
export function flow<A, B, C>(f: (a: A) => B, g: (b: B) => C): (a: A) => C {
  return a => g(f(a))
}
