import type { Lens } from "@fp-ts/optic"
import { identity } from "./Function.js"

import * as OPTIC from "@fp-ts/optic"

import { dual } from "@effect/io/Debug"

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
 * @tsplus fluent fp-ts/optic/Optic replaceIfDefined
 */
export function replaceIfDefined_<S, A>(lens: Lens<S, A>) {
  return <B>(b: B | undefined, map: (b: B) => A) => b !== undefined ? lens.replace(map(b)) : identity
}

export function replaceIfDefined<S, A>(lens: Lens<S, A>) {
  return <B>(map: (b: B) => A) => (b: B | undefined) => replaceIfDefined_(lens)(b, map)
}

/**
 * @tsplus fluent fp-ts/optic/Optic modifyM
 */
export function modifyM_<R, E, A, B>(
  l: Lens<A, B>,
  mod: (b: B) => Effect<R, E, B>
) {
  return (a: A) => modifyM__(l, a, mod)
}

/**
 * @tsplus fluent fp-ts/optic/Optic modifyM_
 */
export function modifyM__<R, E, A, B>(
  l: Lens<A, B>,
  a: A,
  mod: (b: B) => Effect<R, E, B>
) {
  return Effect.gen(function*($) {
    const b = yield* $(mod(l.get(a)))
    return l.replace(b)(a)
  })
}

/**
 * @tsplus fluent fp-ts/optic/Optic modifyConcat
 */
export function modifyConcat<A, B>(l: Lens<A, readonly B[]>, a: A) {
  return (v: readonly B[]) => modifyConcat_(l, a, v)
}

/**
 * @tsplus fluent fp-ts/optic/Optic modifyConcat_
 */
export function modifyConcat_<A, B>(
  l: Lens<A, readonly B[]>,
  a: A,
  v: readonly B[]
) {
  return l.modify(a, b => b.concat(v))
}

export function modifyM<A, B>(l: Lens<A, B>) {
  return <R, E>(mod: (b: B) => Effect<R, E, B>) => modifyM_(l, mod)
}

/**
 * @tsplus fluent fp-ts/optic/Optic modify2M
 */
export function modify2M_<R, E, A, B, EVT>(
  l: Lens<A, B>,
  mod: (b: B) => Effect<R, E, readonly [B, EVT]>
) {
  return (a: A) => modify2M__(l, a, mod)
}

/**
 * @tsplus fluent fp-ts/optic/Optic modify2M_
 */
export function modify2M__<R, E, A, B, EVT>(
  l: Lens<A, B>,
  a: A,
  mod: (b: B) => Effect<R, E, readonly [B, EVT]>
) {
  return Effect.gen(function*($) {
    const [b, evt] = yield* $(mod(l.get(a)))
    return [l.replace(b)(a), evt] as const
  })
}

export function modify2M<A, B>(l: Lens<A, B>) {
  return <R, E, EVT>(mod: (b: B) => Effect<R, E, readonly [B, EVT]>) => modify2M_(l, mod)
}

/**
 * @tsplus fluent fp-ts/optic/Optic modify2
 */
export function modify2_<EVT, A, B>(
  l: Lens<A, B>,
  mod: (b: B) => readonly [B, EVT]
) {
  return (a: A) => modify2__(l, a, mod)
}

/**
 * @tsplus fluent fp-ts/optic/Optic modify2_
 */
export function modify2__<EVT, A, B>(
  l: Lens<A, B>,
  a: A,
  mod: (b: B) => readonly [B, EVT]
) {
  const [b, evt] = mod(l.get(a))
  return [l.replace(b)(a), evt] as const
}

export function modify2<A, B>(l: Lens<A, B>) {
  return <EVT>(mod: (b: B) => readonly [B, EVT]) => modify2_(l, mod)
}
