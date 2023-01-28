/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Lens } from "@fp-ts/optic"
import { identity } from "./Function.js"

import * as OPTIC from "@fp-ts/optic"

import { dual } from "@effect/io/Debug"

export * from "@fp-ts/optic"

/**
 * @tsplus getter fp-ts/optic/Optic replace
 */
export const replace = lazyGetter(<S, A>(l: Lens<S, A>) => {
  const replace = OPTIC.replace(l)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const f: {
    (s: S, a: A): S
    (a: A): (s: S) => S
  } = dual(2, (s: S, a: A) => replace(a)(s))
  return f
})

/**
 * @tsplus getter fp-ts/optic/Optic modify
 */
export const modify = lazyGetter(<S, A>(l: Lens<S, A>) => {
  const modify = OPTIC.modify(l)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const f: {
    (s: S, f: (a: A) => A): S
    (f: (a: A) => A): (s: S) => S
  } = dual(2, (s: S, f: (a: A) => A) => modify(f)(s))
  return f
})

/**
 * @tsplus getter fp-ts/optic/Optic modify2
 */
export const modify2 = lazyGetter(<S, A>(l: Lens<S, A>) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const f: {
    <Evt extends readonly any[]>(s: S, f: (a: A) => readonly [A, ...Evt]): readonly [S, ...Evt]
    <Evt extends readonly any[]>(f: (a: A) => readonly [A, ...Evt]): (s: S) => readonly [S, ...Evt]
  } = dual(2, <Evt extends readonly any[]>(s: S, f: (a: A) => readonly [A, ...Evt]) => {
    const [b, evt] = f(l.get(s))
    return [l.replace(s, b), evt] as const
  })
  return f
})

/**
 * @tsplus getter fp-ts/optic/Optic replaceIfDefined
 */
export const replaceIfDefined = lazyGetter(<S, A>(l: Lens<S, A>) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const f: {
    <B>(b: B | undefined, map: (b: B) => A): (s: S) => S
    <B>(map: (b: B) => A): (b: B | undefined) => (s: S) => S
  } = dual(2, <B>(b: B | undefined, map: (b: B) => A) => b !== undefined ? l.replace(map(b)) : identity)
  return f
})

/**
 * @tsplus getter fp-ts/optic/Optic modifyM
 */
export const modifyM = lazyGetter(<S, A>(l: Lens<S, A>) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const f: {
    <R, E>(s: S, f: (a: A) => Effect<R, E, A>): Effect<R, E, S>
    <R, E>(f: (a: A) => Effect<R, E, A>): (s: S) => Effect<R, E, S>
  } = dual(2, <R, E>(a: S, mod: (b: A) => Effect<R, E, A>) =>
    Effect.gen(function*($) {
      const b = yield* $(mod(l.get(a)))
      return l.replace(b)(a)
    }))
  return f
})

/**
 * @tsplus getter fp-ts/optic/Optic modify2M
 */
export const modify2M = lazyGetter(<S, A>(l: Lens<S, A>) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const f: {
    <R, E, Evt extends readonly any[]>(
      s: S,
      f: (a: A) => Effect<R, E, readonly [A, ...Evt]>
    ): Effect<R, E, readonly [S, ...Evt]>
    <R, E, Evt extends readonly any[]>(
      f: (a: A) => Effect<R, E, readonly [A, ...Evt]>
    ): (s: S) => Effect<R, E, readonly [A, ...Evt]>
  } = dual(
    2,
    <R, E, Evt extends readonly any[]>(a: S, mod: (b: A) => Effect<R, E, readonly [A, ...Evt]>) =>
      Effect.gen(function*($) {
        const [b, evt] = yield* $(mod(l.get(a)))
        return [l.replace(b)(a), evt] as const
      })
  )
  return f
})
