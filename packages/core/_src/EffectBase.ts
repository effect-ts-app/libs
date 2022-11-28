/* eslint-disable prefer-destructuring */
// eslint-disable-next-line @typescript-eslint/no-unused-vars

import { curry, flow, Lazy, pipe } from "./Function.js"
import * as O from "./Maybe.js"

/**
 * @tsplus static effect/core/io/Effect.Ops flatMapEither
 */
export const flatMapEither = <E, A, A2>(ei: (a: A2) => Either<E, A>) =>
  Effect.$.flatMap((a: A2) => Effect.fromEither(ei(a)))

/**
 * @tsplus fluent effect/core/io/Effect flatMapMaybe
 */
export function flatMapMaybe<R, E, A, R2, E2, A2>(
  self: Effect<R, E, Maybe<A>>,
  fm: (a: A) => Effect<R2, E2, A2>
) {
  return self.flatMap((d) =>
    d.fold(
      () => Effect(Maybe.none),
      (_) => fm(_).map(Maybe.some)
    )
  )
}

/**
 * @tsplus fluent effect/core/io/Effect tapMaybe
 */
export function tapMaybe<R, E, A, R2, E2, A2>(
  self: Effect<R, E, Maybe<A>>,
  fm: (a: A) => Effect<R2, E2, A2>
) {
  return self.flatMap((d) =>
    d.fold(
      () => Effect(Maybe.none),
      (_) => fm(_).map(() => Maybe.some(_))
    )
  )
}

/**
 * @tsplus fluent effect/core/io/Effect zipRightMaybe
 */
export function zipRightMaybe<R, E, A, R2, E2, A2>(
  self: Effect<R, E, Maybe<A>>,
  fm: Effect<R2, E2, A2>
) {
  return self.flatMap((d) =>
    d.fold(
      () => Effect(Maybe.none),
      (_) => fm.map(() => Maybe.some(_))
    )
  )
}

/**
 * @tsplus fluent effect/core/io/Effect mapMaybe
 */
export function mapMaybe<R, E, A, A2>(self: Effect<R, E, Maybe<A>>, fm: (a: A) => A2) {
  return self.map((d) =>
    d.fold(
      () => Maybe.none,
      (_) => Maybe.some(fm(_))
    )
  )
}

export type Erase<R, K> = R & K extends K & infer R1 ? R1 : R

/**
 * @tsplus static effect/core/io/Effect.Ops tryCatchPromiseWithInterrupt
 */
export function tryCatchPromiseWithInterrupt<E, A>(
  promise: Lazy<Promise<A>>,
  onReject: (reason: unknown) => E,
  canceller: () => void
): Effect<never, E, A> {
  return Effect.asyncInterrupt((resolve) => {
    promise()
      .then((x) => pipe(x, Effect.succeed, resolve))
      .catch((x) => pipe(x, onReject, Effect.fail, resolve))
    return Either.left(Effect.sync(canceller))
  })
}

/**
 * @tsplus fluent effect/core/io/Effect tapBoth
 */
export const tapBoth_ = <R, E, A, R2, R3, E3>(
  self: Effect<R, E, A>,
  // official tapBoth has E2 instead of never
  f: (e: E) => Effect<R2, never, any>,
  g: (a: A) => Effect<R3, E3, any>
) => pipe(self, Effect.$.tapError(f), Effect.$.tap(g))
export const tapBoth =
  <E, A, R2, R3, E3>(
    // official tapBoth has E2 instead of never
    f: (e: E) => Effect<R2, never, any>,
    g: (a: A) => Effect<R3, E3, any>
  ) =>
  <R>(self: Effect<R, E, A>) =>
    tapBoth_(self, f, g)

/**
 * @tsplus fluent effect/core/io/Effect tapBothInclAbort
 */
export const tapBothInclAbort_ = <R, E, A, ER, EE, EA, SR, SE, SA>(
  self: Effect<R, E, A>,
  onError: (err: unknown) => Effect<ER, EE, EA>,
  onSuccess: (a: A) => Effect<SR, SE, SA>
) =>
  pipe(
    self.exit,
    Effect.$.flatMap(
      Exit.$.foldEffect((cause) => {
        const firstError = getFirstError(cause)
        if (firstError) {
          return pipe(
            onError(firstError),
            Effect.$.flatMap(() => Effect.failCause(cause))
          )
        }
        return Effect.failCause(cause)
      }, flow(Effect.succeed, Effect.$.tap(onSuccess)))
    )
  )

export function getFirstError<E>(cause: Cause<E>) {
  if (cause.isDie) {
    const defects = cause.defects
    return defects.unsafeHead
  }
  if (cause.isFailure) {
    const failures = cause.failures
    return failures.unsafeHead
  }
  return null
}

/**
 * @tsplus fluent effect/core/io/Effect tapErrorInclAbort
 */
export const tapErrorInclAbort_ = <R, E, A, ER, EE, EA>(
  self: Effect<R, E, A>,
  onError: (err: unknown) => Effect<ER, EE, EA>
) =>
  pipe(
    self.exit,
    Effect.$.flatMap(
      Exit.$.foldEffect((cause) => {
        const firstError = getFirstError(cause)
        if (firstError) {
          return pipe(
            onError(firstError),
            Effect.$.flatMap(() => Effect.failCauseSync(cause))
          )
        }
        return Effect.failCauseSync(cause)
      }, Effect.succeed)
    )
  )
export function encaseMaybe_<E, A>(
  o: O.Maybe<A>,
  onError: Lazy<E>
): Effect<never, E, A> {
  return O.fold_(o, () => Effect.fail(onError()), Effect.succeed)
}

export function encaseMaybe<E>(onError: Lazy<E>) {
  return <A>(o: O.Maybe<A>) => encaseMaybe_<E, A>(o, onError)
}

export function liftM<A, B>(a: (a: A) => B) {
  return flow(a, Effect.succeed)
}

/**
 * Takes [A, B], applies it to a curried Effect function,
 * taps the Effect, returning A.
 */
export function tupleTap<A, B, R, E, C>(f: (b: B) => (a: A) => Effect<R, E, C>) {
  return (t: readonly [A, B]) => Effect.succeed(t[0]).tap(f(t[1]))
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

export function ifDiff_<I, R, E, A>(n: I, orig: I, f: (i: I) => Effect<R, E, A>) {
  return n !== orig ? f(n) : Effect.unit
}
