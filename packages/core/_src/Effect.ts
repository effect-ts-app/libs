/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-destructuring */
// eslint-disable-next-line @typescript-eslint/no-unused-vars

import * as Fiber from "effect/Fiber"
import * as Def from "effect/Deferred"
import { Option } from "effect/Option"
import { curry, pipe } from "./Function.js"

export * from "effect/Effect"

/**
 * @macro traced
 * @tsplus fluent effect/io/Effect flatMapOpt
 */
export function flatMapOption<R, E, A, R2, E2, A2>(
  self: Effect<R, E, Option<A>>,
  fm: (a: A) => Effect<R2, E2, A2>
): Effect<R | R2, E | E2, Option<A2>> {
  return self.flatMap((d) =>
    d.match({
      onNone: () => Effect(Option.none),
      onSome: (_) => fm(_).map(Option.some)
    })
  )
}

/**
 * @macro traced
 * @tsplus fluent effect/io/Effect tapOpt
 */
export function tapOption<R, E, A, R2, E2, A2>(
  self: Effect<R, E, Option<A>>,
  fm: (a: A) => Effect<R2, E2, A2>
): Effect<R | R2, E | E2, Option<A>> {
  return self.flatMap((d) =>
    d.match({
      onNone: () => Effect(Option.none),
      onSome: (_) => fm(_).map(() => Option(_))
    })
  )
}

/**
 * @macro traced
 * @tsplus fluent effect/io/Effect zipRightOpt
 */
export function zipRightOption<R, E, A, R2, E2, A2>(
  self: Effect<R, E, Option<A>>,
  fm: Effect<R2, E2, A2>
) {
  return self.flatMap((d) =>
    d.match({
      onNone: () => Effect(Option.none),
      onSome: (_) => fm.map(() => Option(_))
    })
  )
}

/**
 * @macro traced
 * @tsplus fluent effect/io/Effect mapOpt
 */
export function mapOption<R, E, A, A2>(
  self: Effect<R, E, Option<A>>,
  fm: (a: A) => A2
): Effect<R, E, Option<A2>> {
  return self.map((d) =>
    d.match({
      onNone: () => Option.none,
      onSome: (_) => Option(fm(_))
    })
  )
}

/**
 * @tsplus static effect/io/Effect.Ops tryCatchPromiseWithInterrupt
 */
export function tryCatchPromiseWithInterrupt<E, A>(
  promise: LazyArg<Promise<A>>,
  onReject: (reason: unknown) => E,
  canceller: () => void
): Effect<never, E, A> {
  return Effect.asyncEither((resolve) => {
    promise()
      .then((x) => pipe(x, Effect.succeed, resolve))
      .catch((x) => pipe(x, onReject, Effect.fail, resolve))
    return Either.left(Effect.sync(canceller))
  })
}

/**
 * Takes [A, B], applies it to a curried Effect function,
 * taps the Effect, returning A.
 */
export function tupleTap<A, B, R, E, C>(
  f: (b: B) => (a: A) => Effect<R, E, C>
) {
  return (t: readonly [A, B]) => Effect(t[0]).tap(f(t[1]))
}

/**
 * Takes [A, B], applies it to an Effect function,
 * taps the Effect, returning A.
 */
export function tupleTap_<A, B, R, E, C>(f: (a: A, b: B) => Effect<R, E, C>) {
  return tupleTap(curry(f))
}

export function ifDiffR<I, R, E, A>(f: (i: I) => Effect<R, E, A>) {
  return (n: I, orig: I) => ifDiff_(n, orig, f)
}

export function ifDiff_<I, R, E, A>(
  n: I,
  orig: I,
  f: (i: I) => Effect<R, E, A>
) {
  return n !== orig ? f(n) : Effect.unit
}

export function ifDiff<I, R, E, A>(n: I, orig: I) {
  return (f: (i: I) => Effect<R, E, A>) => ifDiff_(n, orig, f)
}

// NOTE: await extension doesnt work via tsplus somehow
/**
 * @tsplus static effect/io/Deferred.Ops await
 * @tsplus getter effect/io/Deferred await
 */
export const await_ = Def.await


/**
 * Ref has atomic modify support if synchronous, for Effect we need a Semaphore.
 * @tsplus fluent effect/io/Ref modifyWithEffect
 */
export function modifyWithPermitWithEffect<A>(ref: Ref<A>, semaphore: Semaphore) {
  const withPermit = semaphore.withPermits(1)
  return <R, E, A2>(mod: (a: A) => Effect<R, E, readonly [A2, A]>) =>
    withPermit(
      ref
        .get
        .flatMap(mod)
        .tap(([, _]) => ref.set(_))
        .map(([_]) => _)
    )
}

/**
 * @tsplus getter Iterable joinAll
 * @tsplus static effect/io/Effect.Ops joinAll
 */
export function joinAll<E, A>(fibers: Iterable<Fiber.Fiber<E, A>>): Effect<never, E, readonly A[]> {
  return Fiber.join(Fiber.all(fibers))
}
