// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Cause } from "@effect-ts/core"
import {
  chain,
  Effect,
  effectAsyncInterrupt,
  fail,
  fromEither,
  halt,
  if_,
  IO,
  result,
  succeed,
  succeedWith,
  tap,
  tapError,
  unit,
} from "@effect-ts/core/Effect"
import * as Ex from "@effect-ts/core/Effect/Exit"
import type * as Ei from "@effect-ts/core/Either"
import * as O from "@effect-ts/core/Option"

import { constant, flow, Lazy, pipe } from "./Function.js"
import { curry } from "./utils.js"

export const encaseEither = <E, A>(ei: Ei.Either<E, A>) => fromEither(() => ei)
export const chainEither = <E, A, A2>(ei: (a: A2) => Ei.Either<E, A>) =>
  chain((a: A2) => fromEither(() => ei(a)))

export type Erase<R, K> = R & K extends K & infer R1 ? R1 : R

export function tryCatchPromiseWithInterrupt<E, A>(
  promise: Lazy<Promise<A>>,
  onReject: (reason: unknown) => E,
  canceller: () => void,
  __trace?: string
): IO<E, A> {
  return effectAsyncInterrupt((resolve) => {
    promise()
      .then((x) => pipe(x, succeed, resolve))
      .catch((x) => pipe(x, onReject, fail, resolve))
    return succeedWith(canceller)
  }, __trace)
}

export const tapBoth_ = <R, E, A, R2, R3, E3>(
  self: Effect<R, E, A>,
  // official tapBoth has E2 instead of never
  f: (e: E) => Effect<R2, never, any>,
  g: (a: A) => Effect<R3, E3, any>
) => pipe(self, tapError(f), tap(g))
export const tapBoth =
  <E, A, R2, R3, E3>(
    // official tapBoth has E2 instead of never
    f: (e: E) => Effect<R2, never, any>,
    g: (a: A) => Effect<R3, E3, any>
  ) =>
  <R>(self: Effect<R, E, A>) =>
    tapBoth_(self, f, g)

export const tapBothInclAbort_ = <R, E, A, ER, EE, EA, SR, SE, SA>(
  self: Effect<R, E, A>,
  onError: (err: unknown) => Effect<ER, EE, EA>,
  onSuccess: (a: A) => Effect<SR, SE, SA>
) =>
  pipe(
    self,
    result,
    chain(
      Ex.foldM((cause) => {
        const firstError = getFirstError(cause)
        if (firstError) {
          return pipe(
            onError(firstError),
            chain(() => halt(cause))
          )
        }
        return halt(cause)
      }, flow(succeed, tap(onSuccess)))
    )
  )

export function getFirstError<E>(cause: Cause.Cause<E>) {
  if (Cause.died(cause)) {
    const defects = Cause.defects(cause)
    return defects[0]
  }
  if (Cause.failed(cause)) {
    const failures = Cause.failures(cause)
    return failures[0]
  }
  return null
}

export const tapBothInclAbort =
  <A, ER, EE, EA, SR, SE, SA>(
    onError: (err: unknown) => Effect<ER, EE, EA>,
    onSuccess: (a: A) => Effect<SR, SE, SA>
  ) =>
  <R, E>(eff: Effect<R, E, A>) =>
    tapBothInclAbort_(eff, onError, onSuccess)

export const tapErrorInclAbort_ = <R, E, A, ER, EE, EA>(
  self: Effect<R, E, A>,
  onError: (err: unknown) => Effect<ER, EE, EA>
) =>
  pipe(
    self,
    result,
    chain(
      Ex.foldM((cause) => {
        const firstError = getFirstError(cause)
        if (firstError) {
          return pipe(
            onError(firstError),
            chain(() => halt(cause))
          )
        }
        return halt(cause)
      }, succeed)
    )
  )
export const tapErrorInclAbort =
  <A, ER, EE, EA>(onError: (err: unknown) => Effect<ER, EE, EA>) =>
  <R, E>(eff: Effect<R, E, A>) =>
    tapErrorInclAbort_(eff, onError)

export function encaseOption_<E, A>(o: O.Option<A>, onError: Lazy<E>): IO<E, A> {
  return O.fold_(o, () => fail(onError()), succeed)
}

export function encaseOption<E>(onError: Lazy<E>) {
  return <A>(o: O.Option<A>) => encaseOption_<E, A>(o, onError)
}

export function liftM<A, B>(a: (a: A) => B) {
  return flow(a, succeed)
}

/**
 * Takes [A, B], applies it to a curried Effect function,
 * taps the Effect, returning A.
 */
export function tupleTap<A, B, R, E, C>(f: (b: B) => (a: A) => Effect<R, E, C>) {
  return (t: readonly [A, B]) => succeed(t[0])["|>"](tap(f(t[1])))
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

export function ifDiff<I, R, E, A>(n: I, orig: I) {
  return (f: (i: I) => Effect<R, E, A>) => ifDiff_(n, orig, f)
}

export function ifDiff_<I, R, E, A>(n: I, orig: I, f: (i: I) => Effect<R, E, A>) {
  return if_(n !== orig, () => f(n), constUnit)
}

const constUnit = constant(unit)

export * from "@effect-ts/core/Effect"
