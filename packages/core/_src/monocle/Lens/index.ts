// ets_tracing: off

/**
 * A `Lens` is an optic used to zoom inside a product.
 *
 * `Lens`es have two type parameters generally called `S` and `A`: `Lens<S, A>` where `S` represents the product and `A`
 * an element inside of `S`.
 *
 * Laws:
 *
 * 1. get(set(a)(s)) = a
 * 2. set(get(s))(s) = s
 * 3. set(a)(set(a)(s)) = set(a)(s)
 */
import type { Either } from "@effect-ts/core/Either"
import type { Predicate, Refinement } from "@effect-ts/core/Function"
import { flow, pipe } from "@effect-ts/core/Function"
import type { Option } from "@effect-ts/core/Option"
import type { URI } from "@effect-ts/core/Prelude"
import * as P from "@effect-ts/core/Prelude"
import type { HashMap } from "@effect-ts/system/Collections/Immutable/HashMap"

import * as _ from "../Internal/index.js"
import { Lens } from "../Internal/index.js"
import type { Optional } from "../Optional/index.js"
import type { Prism } from "../Prism/index.js"
import type { Traversal } from "../Traversal/index.js"

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------
export { Lens }

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

export const id: <S>() => Lens<S, S> = _.lensId

// -------------------------------------------------------------------------------------
// converters
// -------------------------------------------------------------------------------------

/**
 * View a `Lens` as a `Optional`
 */
export const asOptional: <S, A>(sa: Lens<S, A>) => Optional<S, A> = _.lensAsOptional

/**
 * View a `Lens` as a `Traversal`
 */
export const asTraversal: <S, A>(sa: Lens<S, A>) => Traversal<S, A> = _.lensAsTraversal

// -------------------------------------------------------------------------------------
// compositions
// -------------------------------------------------------------------------------------

/**
 * Compose a `Lens` with a `Lens`
 */
export const compose: <A, B>(ab: Lens<A, B>) => <S>(sa: Lens<S, A>) => Lens<S, B> =
  _.lensComposeLens

/**
 * Compose a `Lens` with a `Prism`
 */
export const composePrism: <A, B>(
  ab: Prism<A, B>
) => <S>(sa: Lens<S, A>) => Optional<S, B> = _.lensComposePrism

/**
 * Compose a `Lens` with an `Optional`
 */
export const composeOptional =
  <A, B>(ab: Optional<A, B>) =>
  <S>(sa: Lens<S, A>): Optional<S, B> =>
    _.optionalComposeOptional(ab)(asOptional(sa))

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

export const modify =
  <A>(f: (a: A) => A) =>
  <S>(sa: Lens<S, A>) =>
  (s: S): S => {
    const o = sa.get(s)
    const n = f(o)
    return o === n ? s : sa.set(n)(s)
  }

/**
 * Return a `Optional` from a `Lens` focused on a nullable value
 */
export const fromNullable = <S, A>(sa: Lens<S, A>): Optional<S, NonNullable<A>> =>
  _.lensComposePrism(_.prismFromNullable<A>())(sa)

export function filter<A, B extends A>(
  refinement: Refinement<A, B>
): <S>(sa: Lens<S, A>) => Optional<S, B>
export function filter<A>(
  predicate: Predicate<A>
): <S>(sa: Lens<S, A>) => Optional<S, A>
export function filter<A>(
  predicate: Predicate<A>
): <S>(sa: Lens<S, A>) => Optional<S, A> {
  return composePrism(_.prismFromPredicate(predicate))
}

/**
 * Return a `Lens` from a `Lens` and a prop
 */
export const prop: <A, P extends keyof A>(
  prop: P
) => <S>(sa: Lens<S, A>) => Lens<S, A[P]> = _.lensProp

/**
 * Return a `Lens` from a `Lens` and a list of props
 */
export const props: <A, P extends keyof A>(
  ...props: [P, P, ...Array<P>]
) => <S>(sa: Lens<S, A>) => Lens<S, { [K in P]: A[K] }> = _.lensProps

/**
 * Return a `Lens` from a `Lens` and a component
 */
export const component: <A extends ReadonlyArray<unknown>, P extends keyof A>(
  prop: P
) => <S>(sa: Lens<S, A>) => Lens<S, A[P]> = _.lensComponent

/**
 * Return a `Optional` from a `Lens` focused on a `ReadonlyArray`
 */
export const index =
  (i: number) =>
  <S, A>(sa: Lens<S, ReadonlyArray<A>>): Optional<S, A> =>
    pipe(sa, asOptional, _.optionalComposeOptional(_.indexArray<A>().index(i)))

/**
 * Return a `Optional` from a `Lens` focused on a `ReadonlyRecord` and a key
 */
export const keyInRecord =
  (key: string) =>
  <S, A>(sa: Lens<S, Readonly<Record<string, A>>>): Optional<S, A> =>
    pipe(sa, asOptional, _.optionalComposeOptional(_.indexRecord<A>().index(key)))

/**
 * Return a `Lens` from a `Lens` focused on a `ReadonlyRecord` and a required key
 */
export const atKeyInRecord =
  (key: string) =>
  <S, A>(sa: Lens<S, Readonly<Record<string, A>>>): Lens<S, Option<A>> =>
    pipe(sa, compose(_.atRecord<A>().at(key)))

/**
 * Return a `Optional` from a `Lens` focused on a `HashMap` and a key
 */
export const keyInHashMap =
  <K = never>(key: K) =>
  <S, A>(sa: Lens<S, Readonly<HashMap<K, A>>>): Optional<S, A> =>
    pipe(sa, asOptional, _.optionalComposeOptional(_.indexHashMap<K, A>().index(key)))

/**
 * Return a `Lens` from a `Lens` focused on a `HashMap` and a required key
 */
export const atKeyInHashMap =
  <K>(key: K) =>
  <S, A>(sa: Lens<S, Readonly<HashMap<K, A>>>): Lens<S, Option<A>> =>
    pipe(sa, compose(_.atHashMap<K, A>().at(key)))

/**
 * Return a `Optional` from a `Lens` focused on the `Some` of a `Option` type
 */
export const some: <S, A>(soa: Lens<S, Option<A>>) => Optional<S, A> = composePrism(
  _.prismSome()
)

/**
 * Return a `Optional` from a `Lens` focused on the `Right` of a `Either` type
 */
export const right: <S, E, A>(sea: Lens<S, Either<E, A>>) => Optional<S, A> =
  composePrism(_.prismRight())

/**
 * Return a `Optional` from a `Lens` focused on the `Left` of a `Either` type
 */
export const left: <S, E, A>(sea: Lens<S, Either<E, A>>) => Optional<S, E> =
  composePrism(_.prismLeft())

/**
 * Pipeable set
 */
export const set =
  <A>(a: A) =>
  <S>(lens: Lens<S, A>) =>
    lens.set(a)

/**
 * Pipeable get
 */
export const get = <S, A>(lens: Lens<S, A>) => lens.get

/**
 * Return a `Traversal` from a `Lens` focused on a `ForEach`
 */
export function forEach<T extends P.URIS, C = P.Auto>(
  T: P.ForEach<T, C>
): <TK, TQ, TW, TX, TI, TS, TR, TE, S, A>(
  sta: Lens<S, P.Kind<T, C, TK, TQ, TW, TX, TI, TS, TR, TE, A>>
) => Traversal<S, A> {
  return flow(asTraversal, _.traversalComposeTraversal(_.fromForEach(T)()))
}

export const find: <A>(
  predicate: Predicate<A>
) => <S>(sa: Lens<S, ReadonlyArray<A>>) => Optional<S, A> = flow(
  _.find,
  composeOptional
)

// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------

export const imap: <A, B>(
  f: (a: A) => B,
  g: (b: B) => A
) => <E>(sa: Lens<E, A>) => Lens<E, B> = (f, g) => (ea) =>
  new Lens({ get: flow(ea.get, f), set: flow(g, ea.set) })

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

export const LensURI = "monocle/Lens"
export type LensURI = typeof LensURI

declare module "@effect-ts/core/Prelude/HKT" {
  export interface URItoKind<FC, TC, K, Q, W, X, I, S, R, E, A> {
    [LensURI]: Lens<I, A>
  }
}

export const Category = P.instance<P.Category<[URI<LensURI>]>>({
  compose,
  id
})

export const Invariant = P.instance<P.Invariant<[URI<LensURI>]>>({
  invmap: ({ f, g }) => ({
    f: imap(f, g),
    g: imap(g, f)
  })
})
