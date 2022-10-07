// ets_tracing: off

/**
 * An `Iso` is an optic which converts elements of type `S` into elements of type `A` without loss.
 *
 * Laws:
 *
 * 1. reverseGet(get(s)) = s
 * 2. get(reversetGet(a)) = a
 */
import { flow, identity } from "@effect-ts/core/Function"
import type { Newtype } from "@effect-ts/core/Newtype"
import type { URI } from "@effect-ts/core/Prelude"
import * as P from "@effect-ts/core/Prelude"

import * as _ from "../Internal/index.js"
import {
  Iso,
  isoAsPrism as asPrism,
  isoAsTraversal as asTraversal,
  isoComposeIso as compose
} from "../Internal/index.js"
import type { Lens } from "../Lens/index.js"
import type { Optional } from "../Optional/index.js"

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------
export { Iso }
/**
 * View an `Iso` as a `Prism`
 */
export { asPrism }
// -------------------------------------------------------------------------------------
// compositions
// -------------------------------------------------------------------------------------
export { compose }
/**
 * View an `Iso` as a `Traversal`
 */
export { asTraversal }

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

export const id = <S>(): Iso<S, S> =>
  new Iso({
    get: identity,
    reverseGet: identity
  })

// -------------------------------------------------------------------------------------
// converters
// -------------------------------------------------------------------------------------

/**
 * View an `Iso` as a `Lens`
 */
export const asLens: <S, A>(sa: Iso<S, A>) => Lens<S, A> = _.isoAsLens

/**
 * View an `Iso` as a `Optional`
 */
export const asOptional: <S, A>(sa: Iso<S, A>) => Optional<S, A> = _.isoAsOptional

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

export const reverse = <S, A>(sa: Iso<S, A>): Iso<A, S> =>
  new Iso({
    get: sa.reverseGet,
    reverseGet: sa.get
  })

export const modify =
  <A>(f: (a: A) => A) =>
  <S>(sa: Iso<S, A>) =>
  (s: S): S =>
    sa.reverseGet(f(sa.get(s)))

// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------

export const imap: <A, B>(
  f: (a: A) => B,
  g: (b: B) => A
) => <S>(sa: Iso<S, A>) => Iso<S, B> = (f, g) => (ea) =>
  new Iso({
    get: flow(ea.get, f),
    reverseGet: flow(g, ea.reverseGet)
  })

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

export const IsoURI = "monocle/Iso"
export type IsoURI = typeof IsoURI

declare module "@effect-ts/core/Prelude/HKT" {
  export interface URItoKind<FC, TC, K, Q, W, X, I, S, R, E, A> {
    [IsoURI]: Iso<I, A>
  }
}

export const Category = P.instance<P.Category<[URI<IsoURI>]>>({
  compose,
  id
})

export const Invariant = P.instance<P.Invariant<[URI<IsoURI>]>>({
  invmap: ({ f, g }) => ({
    f: imap(f, g),
    g: imap(g, f)
  })
})

export function newtype<T extends Newtype<any, any>>(): Iso<T["_A"], T> {
  return new Iso({
    get: (_) => _ as any,
    reverseGet: (_) => _ as any
  })
}
