// ets_tracing: off

/**
 * A `Prism` is an optic used to select part of a sum type.
 *
 * Laws:
 *
 * 1. getOption(s).fold(s, reverseGet) = s
 * 2. getOption(reverseGet(a)) = Some(a)
 */
import type { Either } from "@effect-ts/core/Either"
import type { Predicate, Refinement } from "@effect-ts/core/Function"
import { flow, identity, pipe } from "@effect-ts/core/Function"
import type { Newtype } from "@effect-ts/core/Newtype"
import * as O from "@effect-ts/core/Option"
import type { URI } from "@effect-ts/core/Prelude"
import * as P from "@effect-ts/core/Prelude"
import type { HashMap } from "@effect-ts/system/Collections/Immutable/HashMap"

import * as _ from "../Internal/index.js"
import { composePrism as compose, Prism } from "../Internal/index.js"
import type { Lens } from "../Lens/index.js"
import type { Optional } from "../Optional/index.js"
import type { Traversal } from "../Traversal/index.js"

import Option = O.Option

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------
export { Prism }

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

export const id = <S>(): Prism<S, S> =>
  new Prism({
    getOption: O.some,
    reverseGet: identity
  })

export const fromPredicate: {
  <S, A extends S>(refinement: Refinement<S, A>): Prism<S, A>
  <A>(predicate: Predicate<A>): Prism<A, A>
} = _.prismFromPredicate

// -------------------------------------------------------------------------------------
// converters
// -------------------------------------------------------------------------------------

/**
 * View a `Prism` as a `Optional`
 */
export const asOptional: <S, A>(sa: Prism<S, A>) => Optional<S, A> = _.prismAsOptional

/**
 * View a `Prism` as a `Traversal`
 */
export const asTraversal: <S, A>(sa: Prism<S, A>) => Traversal<S, A> =
  _.prismAsTraversal

// -------------------------------------------------------------------------------------
// compositions
// -------------------------------------------------------------------------------------

export { compose }

/**
 * Compose a `Prism` with a `Lens`
 */
export const composeLens: <A, B>(
  ab: Lens<A, B>
) => <S>(sa: Prism<S, A>) => Optional<S, B> = _.prismComposeLens

/**
 * Compose a `Prism` with an `Optional`
 */
export const composeOptional =
  <A, B>(ab: Optional<A, B>) =>
  <S>(sa: Prism<S, A>): Optional<S, B> =>
    _.optionalComposeOptional(ab)(asOptional(sa))

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

export const set: <A>(a: A) => <S>(sa: Prism<S, A>) => (s: S) => S = _.prismSet

export const modifyOption: <A>(
  f: (a: A) => A
) => <S>(sa: Prism<S, A>) => (s: S) => Option<S> = _.prismModifyOption

export const modify: <A>(f: (a: A) => A) => <S>(sa: Prism<S, A>) => (s: S) => S =
  _.prismModify

/**
 * Return a `Prism` from a `Prism` focused on a nullable value
 */
export const fromNullable: <S, A>(sa: Prism<S, A>) => Prism<S, NonNullable<A>> =
  compose(_.prismFromNullable())

export function filter<A, B extends A>(
  refinement: Refinement<A, B>
): <S>(sa: Prism<S, A>) => Prism<S, B>
export function filter<A>(predicate: Predicate<A>): <S>(sa: Prism<S, A>) => Prism<S, A>
export function filter<A>(
  predicate: Predicate<A>
): <S>(sa: Prism<S, A>) => Prism<S, A> {
  return compose(_.prismFromPredicate(predicate))
}

/**
 * Return a `Optional` from a `Prism` and a prop
 */
export const prop = <A, P extends keyof A>(
  prop: P
): (<S>(sa: Prism<S, A>) => Optional<S, A[P]>) =>
  composeLens(pipe(_.lensId<A>(), _.lensProp(prop)))

/**
 * Return a `Optional` from a `Prism` and a list of props
 */
export const props = <A, P extends keyof A>(
  ...props: [P, P, ...Array<P>]
): (<S>(sa: Prism<S, A>) => Optional<S, { [K in P]: A[K] }>) =>
  composeLens(pipe(_.lensId<A>(), _.lensProps(...props)))

/**
 * Return a `Optional` from a `Prism` and a component
 */
export const component = <A extends ReadonlyArray<unknown>, P extends keyof A>(
  prop: P
): (<S>(sa: Prism<S, A>) => Optional<S, A[P]>) =>
  composeLens(pipe(_.lensId<A>(), _.lensComponent(prop)))

/**
 * Return a `Optional` from a `Prism` focused on a `ReadonlyArray`
 */
export const index =
  (i: number) =>
  <S, A>(sa: Prism<S, ReadonlyArray<A>>): Optional<S, A> =>
    pipe(sa, asOptional, _.optionalComposeOptional(_.indexArray<A>().index(i)))

/**
 * Return a `Optional` from a `Prism` focused on a `ReadonlyRecord` and a key
 */
export const keyInRecord =
  (key: string) =>
  <S, A>(sa: Prism<S, Readonly<Record<string, A>>>): Optional<S, A> =>
    pipe(sa, asOptional, _.optionalComposeOptional(_.indexRecord<A>().index(key)))

/**
 * Return a `Optional` from a `Prism` focused on a `ReadonlyRecord` and a required key
 */
export const atKeyInRecord =
  (key: string) =>
  <S, A>(sa: Prism<S, Readonly<Record<string, A>>>): Optional<S, Option<A>> =>
    _.prismComposeLens(_.atRecord<A>().at(key))(sa)

/**
 * Return a `Optional` from a `Prism` focused on a `HashMap` and a key
 */
export const keyInHashMap =
  <K = never>(key: K) =>
  <S, A>(sa: Prism<S, Readonly<HashMap<K, A>>>): Optional<S, A> =>
    pipe(sa, asOptional, _.optionalComposeOptional(_.indexHashMap<K, A>().index(key)))

/**
 * Return a `Optional` from a `Prism` focused on a `HashMap` and a required key
 */
export const atKeyInHashMap =
  <K = never>(key: K) =>
  <S, A>(sa: Prism<S, Readonly<HashMap<K, A>>>): Optional<S, Option<A>> =>
    _.prismComposeLens(_.atHashMap<K, A>().at(key))(sa)

/**
 * Return a `Prism` from a `Prism` focused on the `Some` of a `Option` type
 */
export const some: <S, A>(soa: Prism<S, Option<A>>) => Prism<S, A> = compose(
  _.prismSome()
)

/**
 * Return a `Prism` from a `Prism` focused on the `Right` of a `Either` type
 */
export const right: <S, E, A>(sea: Prism<S, Either<E, A>>) => Prism<S, A> = compose(
  _.prismRight()
)

/**
 * Return a `Prism` from a `Prism` focused on the `Left` of a `Either` type
 */
export const left: <S, E, A>(sea: Prism<S, Either<E, A>>) => Prism<S, E> = compose(
  _.prismLeft()
)

/**
 * Return a `Traversal` from a `Prism` focused on a `ForEach`
 */
export function forEach<T extends P.URIS, C = P.Auto>(
  T: P.ForEach<T, C>
): <TK, TQ, TW, TX, TI, TS, TR, TE, S, A>(
  sta: Prism<S, P.Kind<T, C, TK, TQ, TW, TX, TI, TS, TR, TE, A>>
) => Traversal<S, A> {
  return flow(asTraversal, _.traversalComposeTraversal(_.fromForEach(T)()))
}

export const find: <A>(
  predicate: Predicate<A>
) => <S>(sa: Prism<S, ReadonlyArray<A>>) => Optional<S, A> = flow(
  _.find,
  composeOptional
)

// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------

export const imap: <A, B>(
  f: (a: A) => B,
  g: (b: B) => A
) => <E>(sa: Prism<E, A>) => Prism<E, B> = (f, g) => (ea) =>
  new Prism({
    getOption: flow(ea.getOption, O.map(f)),
    reverseGet: flow(g, ea.reverseGet)
  })

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

export const PrismURI = "monocle/Prism"
export type PrismURI = typeof PrismURI

declare module "@effect-ts/core/Prelude/HKT" {
  export interface URItoKind<FC, TC, K, Q, W, X, I, S, R, E, A> {
    [PrismURI]: Prism<I, A>
  }
}

export const Category = P.instance<P.Category<[URI<PrismURI>]>>({
  compose,
  id
})

export const Invariant = P.instance<P.Invariant<[URI<PrismURI>]>>({
  invmap: ({ f, g }) => ({
    f: imap(f, g),
    g: imap(g, f)
  })
})

export function newtype<T extends Newtype<any, any>>(
  getOption: (_: T["_A"]) => boolean
): Prism<T["_A"], T> {
  return new Prism({
    getOption: (_) => (getOption(_) ? O.some(_) : O.none),
    reverseGet: (_) => _ as any
  })
}
