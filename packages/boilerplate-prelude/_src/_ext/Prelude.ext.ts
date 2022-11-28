import "@effect-ts-app/core/_ext/Prelude.ext"

// import "./EffectMaybe.ext.js"
import "./Has.ext.js"
import "./Lens.ext.js"
import "./Ref.js"
import "./Schema.ext.js"

import { Option } from "@effect-ts/core"
import { asUnit } from "@effect/core/io/Effect"
import { concreteChunkId } from "@tsplus/stdlib/collections/Chunk"

export type _R<T extends Effect<any, any, any>> = [T] extends [
  Effect<infer R, any, any>
] ? R
  : never

export type _E<T extends Effect<any, any, any>> = [T] extends [
  Effect<any, infer E, any>
] ? E
  : never

/**
 * @tsplus fluent Maybe encaseInEffect
 */
export function encaseMaybeInEffect_<E, A>(
  o: Maybe<A>,
  onError: Lazy<E>
): Effect<never, E, A> {
  return o.fold(() => Effect.fail(onError()), Effect.succeed)
}

/**
 * @tsplus getter Either asEffect
 */
export const EitherasEffect = Effect.fromEither

/**
 * @tsplus fluent Maybe encaseInEither
 */
export function encaseMaybeEither_<E, A>(
  o: Maybe<A>,
  onError: Lazy<E>
): Either<E, A> {
  return o.fold(() => Either.left(onError()), Either.right)
}

type Service<T> = T extends Tag<infer S> ? S : never
type Values<T> = T extends { [s: string]: infer S } ? Service<S> : never
type Services<T extends Record<string, Tag<any>>> = { [key in keyof T]: Service<T[key]> }

/**
 * @tsplus static effect/core/io/Effect.Ops servicesWith
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
 * @tsplus static effect/core/io/Effect.Ops servicesWithEffect
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
 * @tsplus getter effect/core/io/Effect toNullable
 */
export function toNullable<R, E, A>(
  self: Effect<R, E, Maybe<A>>
) {
  return self.map(_ => _.toNullable)
}

/**
 * @tsplus fluent effect/core/io/Effect scope
 */
export function scope<R, E, A, R2, E2, A2>(
  scopedEffect: Effect<R | Scope, E, A>,
  effect: Effect<R2, E2, A2>
): Effect<Exclude<R | R2, Scope>, E | E2, A2> {
  return scopedEffect.zipRight(effect).scoped
}

/**
 * @tsplus fluent effect/core/io/Effect flatMapScoped
 */
export function flatMapScoped<R, E, A, R2, E2, A2>(
  scopedEffect: Effect<R | Scope, E, A>,
  effect: (a: A) => Effect<R2, E2, A2>
): Effect<Exclude<R | R2, Scope>, E | E2, A2> {
  return scopedEffect.flatMap(effect).scoped
}

// /**
//  * @tsplus fluent effect/core/io/Effect withScoped
//  */
// export function withScoped<R, E, A, R2, E2, A2>(
//   effect: Effect<R2, E2, A2>,
//   scopedEffect: Effect<R | Scope, E, A>
// ): Effect<Exclude<R | R2, Scope>, E | E2, A2> {
//   return scopedEffect.zipRight(effect).scoped
// }

// /**
//  * @tsplus fluent effect/core/io/Effect withScoped
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
 * @tsplus static effect/core/io/Effect.Aspects catchAllMap
 * @tsplus pipeable effect/core/io/Effect catchAllMap
 */
export function catchAllMap<E, A2>(f: (e: E) => A2) {
  return <R, A>(self: Effect<R, E, A>): Effect<R, never, A2 | A> => self.catchAll(err => Effect(f(err)))
}

/**
 * @tsplus static effect/core/io/Effect.Aspects asUnit
 */
export const asUnitE = asUnit

/**
 * @tsplus getter Maybe toOption
 * @tsplus static ets/Maybe.Ops toOption
 */
export function toOption<A>(o: Maybe<A>): Option.Option<A> {
  return o._tag === "None" ? Option.none : Option.some(o.value)
}

/**
 * @tsplus fluent effect/core/io/Effect withSpan
 */
export function withSpan<R, E, A>(self: Effect<R, E, A>, label: string) {
  return self.apply(Effect.logSpan(label))
}

/**
 * Annotates each log in this effect with the specified log annotations.
 * @tsplus static effect/core/io/Effect.Ops logAnnotates
 */
export function logAnnotates(kvps: Record<string, string>) {
  return <R, E, A>(effect: Effect<R, E, A>): Effect<R, E, A> =>
    FiberRef.currentLogAnnotations
      .get
      .flatMap(annotations =>
        Effect.suspendSucceed(() =>
          effect.apply(
            FiberRef.currentLogAnnotations.locally(
              ImmutableMap.from([...annotations, ...kvps.$$.entries])
            )
          )
        )
      )
}

/**
 * Annotates each log in this scope with the specified log annotation.
 *
 * @tsplus static effect/core/io/Effect.Ops logAnnotateScoped
 */
export function logAnnotateScoped(key: string, value: string) {
  return FiberRef.currentLogAnnotations
    .get
    .flatMap(annotations =>
      Effect.suspendSucceed(() =>
        FiberRef.currentLogAnnotations.locallyScoped(
          annotations.set(key, value)
        )
      )
    )
}

/**
 * Annotates each log in this scope with the specified log annotations.
 *
 * @tsplus static effect/core/io/Effect.Ops logAnnotatesScoped
 */
export function logAnnotatesScoped(kvps: Record<string, string>) {
  return FiberRef.currentLogAnnotations
    .get
    .flatMap(annotations =>
      Effect.suspendSucceed(() =>
        FiberRef.currentLogAnnotations.locallyScoped(
          ImmutableMap.from([...annotations, ...kvps.$$.entries])
        )
      )
    )
}

/**
 * Returns the first element that satisfies the predicate.
 *
 * @tsplus static Chunk.Aspects findMap
 * @tsplus pipeable Chunk findMap
 */
export function findMap<A, B>(f: (a: A) => Maybe<B>): (self: Chunk<A>) => Maybe<B> {
  return (self: Chunk<A>): Maybe<B> => {
    const iterator = concreteChunkId(self)._arrayLikeIterator()
    let next

    while ((next = iterator.next()) && !next.done) {
      const array = next.value
      const len = array.length
      let i = 0
      while (i < len) {
        const a = array[i]!
        const r = f(a)
        if (r._tag === "Some") {
          return r
        }
        i++
      }
    }

    return Maybe.none
  }
}

/**
 * @tsplus fluent function flow
 */
export function flow<A, B, C>(f: (a: A) => B, g: (b: B) => C): (a: A) => C {
  return a => g(f(a))
}
