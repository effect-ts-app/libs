import { identity } from "@effect-ts-app/core/Function"

export function setIfDefined_<S, A>(lens: Lens<S, A>) {
  return <B>(b: B | undefined, map: (b: B) => A) =>
    b !== undefined ? lens.set(map(b)) : identity
}

export function setIfDefined<S, A>(lens: Lens<S, A>) {
  return <B>(map: (b: B) => A) =>
    (b: B | undefined) =>
      setIfDefined_(lens)(b, map)
}

export function modifyM_<R, E, A, B>(l: Lens<A, B>, mod: (b: B) => Effect<R, E, B>) {
  return (a: A) => modifyM__(l, a, mod)
}

export function modifyM__<R, E, A, B>(
  l: Lens<A, B>,
  a: A,
  mod: (b: B) => Effect<R, E, B>
) {
  return Effect.gen(function* ($) {
    const b = yield* $(mod(l.get(a)))
    return l.set(b)(a)
  })
}

export function modify__<A, B>(l: Lens<A, B>, a: A, mod: (b: B) => B) {
  return l.set(mod(l.get(a)))(a)
}

export function modifyConcat<A, B>(l: Lens<A, readonly B[]>, a: A) {
  return (v: readonly B[]) => modifyConcat_(l, a, v)
}

export function modifyConcat_<A, B>(l: Lens<A, readonly B[]>, a: A, v: readonly B[]) {
  return modify__(l, a, (b) => b.concat(v))
}

export function modifyM<A, B>(l: Lens<A, B>) {
  return <R, E>(mod: (b: B) => Effect<R, E, B>) => modifyM_(l, mod)
}

export function modify2M_<R, E, A, B, EVT>(
  l: Lens<A, B>,
  mod: (b: B) => Effect<R, E, readonly [B, EVT]>
) {
  return (a: A) => modify2M__(l, a, mod)
}
export function modify2M__<R, E, A, B, EVT>(
  l: Lens<A, B>,
  a: A,
  mod: (b: B) => Effect<R, E, readonly [B, EVT]>
) {
  return Effect.gen(function* ($) {
    const [b, evt] = yield* $(mod(l.get(a)))
    return [l.set(b)(a), evt] as const
  })
}

export function modify2M<A, B>(l: Lens<A, B>) {
  return <R, E, EVT>(mod: (b: B) => Effect<R, E, readonly [B, EVT]>) =>
    modify2M_(l, mod)
}

export function modify2_<EVT, A, B>(l: Lens<A, B>, mod: (b: B) => readonly [B, EVT]) {
  return (a: A) => modify2__(l, a, mod)
}

export function modify2__<EVT, A, B>(
  l: Lens<A, B>,
  a: A,
  mod: (b: B) => readonly [B, EVT]
) {
  const [b, evt] = mod(l.get(a))
  return [l.set(b)(a), evt] as const
}

export function modify2<A, B>(l: Lens<A, B>) {
  return <EVT>(mod: (b: B) => readonly [B, EVT]) => modify2_(l, mod)
}
