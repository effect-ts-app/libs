/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-destructuring */
// eslint-disable-next-line @typescript-eslint/no-unused-vars

import * as Def from "effect/Deferred"
import * as Fiber from "effect/Fiber"
import * as Layer from "effect/Layer"
import { Option } from "effect/Option"
import { curry, flow, pipe } from "./Function.js"

export * from "effect/Effect"

/**
 * @tsplus static effect/io/Deferred.Ops await
 * @tsplus getter effect/io/Deferred await
 */
export const await_ = Def.await

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

export type Erase<R, K> = R & K extends K & infer R1 ? R1 : R

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
 * @macro traced
 * @tsplus fluent effect/io/Effect tapBoth
 */
export const tapBoth_ = <R, E, A, R2, R3, E3>(
  self: Effect<R, E, A>,
  // official tapBoth has E2 instead of never
  f: (e: E) => Effect<R2, never, any>,
  g: (a: A) => Effect<R3, E3, any>
) => self.tapError(f).tap(g)
export const tapBoth = <E, A, R2, R3, E3>(
  // official tapBoth has E2 instead of never
  f: (e: E) => Effect<R2, never, any>,
  g: (a: A) => Effect<R3, E3, any>
) =>
<R>(self: Effect<R, E, A>) => tapBoth_(self, f, g)

/**
 * @macro traced
 * @tsplus fluent effect/io/Effect tapBothInclAbort
 */
export const tapBothInclAbort_ = <R, E, A, ER, EE, EA, SR, SE, SA>(
  self: Effect<R, E, A>,
  onError: (err: unknown) => Effect<ER, EE, EA>,
  onSuccess: (a: A) => Effect<SR, SE, SA>
) =>
  self.exit.flatMap((_) =>
    _.matchEffect({
      onFailure: (cause) => {
        const firstError = getFirstError(cause)
        if (firstError) {
          return onError(firstError).flatMap(() => Effect.failCauseSync(() => cause))
        }
        return Effect.failCauseSync(() => cause)
      },
      onSuccess: (_) => Effect(_).tap(onSuccess)
    })
  )

export function getFirstError<E>(cause: Cause<E>) {
  if (cause.isDie()) {
    const defects = cause.defects
    return defects.unsafeHead
  }
  if (cause.isFailure()) {
    const failures = cause.failures
    return failures.unsafeHead
  }
  return null
}

/**
 * @macro traced
 * @tsplus fluent effect/io/Effect tapErrorInclAbort
 */
export const tapErrorInclAbort_ = <R, E, A, ER, EE, EA>(
  self: Effect<R, E, A>,
  onError: (err: unknown) => Effect<ER, EE, EA>
) =>
  self.exit.flatMap((_) =>
    _.matchEffect({
      onFailure: (cause) => {
        const firstError = getFirstError(cause)
        if (firstError) {
          return onError(firstError)
            .flatMap(() => Effect.failCauseSync(() => cause))
        }
        return Effect.failCauseSync(() => cause)
      },
      onSuccess: Effect.succeed
    })
  )

export function encaseOpt_<E, A>(
  o: Option<A>,
  onError: LazyArg<E>
): Effect<never, E, A> {
  return o.match({
    onNone: () => Effect.fail(onError()),
    onSome: Effect.succeed
  })
}

export function encaseOption<E>(onError: LazyArg<E>) {
  return <A>(o: Option<A>) => encaseOpt_<E, A>(o, onError)
}

export function liftM<A, B>(a: (a: A) => B) {
  return flow(a, Effect.succeed)
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

export const tapBothInclAbort = <A, ER, EE, EA, SR, SE, SA>(
  onError: (err: unknown) => Effect<ER, EE, EA>,
  onSuccess: (a: A) => Effect<SR, SE, SA>
) =>
<R, E>(eff: Effect<R, E, A>) => tapBothInclAbort_(eff, onError, onSuccess)

export const tapErrorInclAbort =
  <A, ER, EE, EA>(onError: (err: unknown) => Effect<ER, EE, EA>) => <R, E>(eff: Effect<R, E, A>) =>
    tapErrorInclAbort_(eff, onError)

export function ifDiff<I, R, E, A>(n: I, orig: I) {
  return (f: (i: I) => Effect<R, E, A>) => ifDiff_(n, orig, f)
}

/**
 * @tsplus static effect/io/Layer.Ops effect
 */
export const LayerFromEffect = Layer.effect

/**
 * @tsplus pipeable effect/io/Effect provideSomeContextReal
 */
export const provideSomeContextReal = <A2>(
  ctx: Context<A2>
) =>
<R, E, A>(self: Effect<R | A2, E, A>): Effect<Exclude<R, A2>, E, A> =>
  (self as Effect<A2, E, A>).mapInputContext((_: Context<never>) => _.merge(ctx))

/**
 * @tsplus pipeable effect/io/Effect provideSomeContextEffect
 */
export const provideSomeContextEffect = <R2, E2, A2>(
  makeCtx: Effect<R2, E2, Context<A2>>
) =>
<R, E, A>(self: Effect<R | A2, E, A>): Effect<R2 | Exclude<R, A2>, E2 | E, A> =>
  makeCtx.flatMap((ctx) => (self as Effect<A2, E, A>).mapInputContext((_: Context<never>) => _.merge(ctx)))

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
