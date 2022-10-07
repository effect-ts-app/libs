// ets_tracing: off

/**
 * A `Traversal` is the generalisation of an `Optional` to several targets. In other word, a `Traversal` allows to focus
 * from a type `S` into `0` to `n` values of type `A`.
 *
 * The most common example of a `Traversal` would be to focus into all elements inside of a container (e.g.
 * `Array`, `Option`). To do this we will use the relation between the typeclass `ForEach` and `Traversal`.
 */
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import * as L from "@effect-ts/core/Collections/Immutable/List"
import * as C from "@effect-ts/core/Const"
import type { Either } from "@effect-ts/core/Either"
import type { Predicate, Refinement } from "@effect-ts/core/Function"
import { identity, pipe } from "@effect-ts/core/Function"
import * as I from "@effect-ts/core/Id"
import type { Identity } from "@effect-ts/core/Identity"
import type { Option } from "@effect-ts/core/Option"
import type { URI } from "@effect-ts/core/Prelude"
import * as P from "@effect-ts/core/Prelude"
import type { HashMap } from "@effect-ts/system/Collections/Immutable/HashMap"

import * as _ from "../Internal/index.js"
import { ModifyF, Traversal } from "../Internal/index.js"

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------
export { ModifyF, Traversal }

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

export const id = <S>(): Traversal<S, S> =>
  new Traversal({
    modifyF:
      <F extends P.URIS, C = P.Auto>(F: P.Applicative<F, C>) =>
      <FK, FQ, FW, FX, FI, FS, FR, FE>(
        f: (a: S) => P.Kind<F, C, FK, FQ, FW, FX, FI, FS, FR, FE, S>
      ): ((s: S) => P.Kind<F, C, FK, FQ, FW, FX, FI, FS, FR, FE, S>) =>
        f
  })

/**
 * Create a `Traversal` from a `ForEach`
 */
export const fromForEach = _.fromForEach

// -------------------------------------------------------------------------------------
// compositions
// -------------------------------------------------------------------------------------

/**
 * Compose a `Traversal` with a `Traversal`
 */
export const compose: <A, B>(
  ab: Traversal<A, B>
) => <S>(sa: Traversal<S, A>) => Traversal<S, B> = _.traversalComposeTraversal

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

export const modify =
  <A>(f: (a: A) => A) =>
  <S>(sa: Traversal<S, A>): ((s: S) => S) => {
    return sa.modifyF(I.Applicative)(f)
  }

export const set = <A>(a: A): (<S>(sa: Traversal<S, A>) => (s: S) => S) => {
  return modify(() => a)
}

export function filter<A, B extends A>(
  refinement: Refinement<A, B>
): <S>(sa: Traversal<S, A>) => Traversal<S, B>
export function filter<A>(
  predicate: Predicate<A>
): <S>(sa: Traversal<S, A>) => Traversal<S, A>
export function filter<A>(
  predicate: Predicate<A>
): <S>(sa: Traversal<S, A>) => Traversal<S, A> {
  return compose(_.prismAsTraversal(_.prismFromPredicate(predicate)))
}

/**
 * Return a `Traversal` from a `Traversal` and a prop
 */
export const prop = <A, P extends keyof A>(
  prop: P
): (<S>(sa: Traversal<S, A>) => Traversal<S, A[P]>) =>
  compose(pipe(_.lensId<A>(), _.lensProp(prop), _.lensAsTraversal))

/**
 * Return a `Traversal` from a `Traversal` and a list of props
 */
export const props = <A, P extends keyof A>(
  ...props: [P, P, ...Array<P>]
): (<S>(sa: Traversal<S, A>) => Traversal<S, { [K in P]: A[K] }>) =>
  compose(pipe(_.lensId<A>(), _.lensProps(...props), _.lensAsTraversal))

/**
 * Return a `Traversal` from a `Traversal` and a component
 */
export const component = <A extends ReadonlyArray<unknown>, P extends keyof A>(
  prop: P
): (<S>(sa: Traversal<S, A>) => Traversal<S, A[P]>) =>
  compose(pipe(_.lensId<A>(), _.lensComponent(prop), _.lensAsTraversal))

/**
 * Return a `Traversal` from a `Traversal` focused on a `ReadonlyArray`
 */
export const index =
  (i: number) =>
  <S, A>(sa: Traversal<S, ReadonlyArray<A>>): Traversal<S, A> =>
    pipe(sa, compose(_.optionalAsTraversal(_.indexArray<A>().index(i))))

/**
 * Return a `Traversal` from a `Traversal` focused on a `ReadonlyRecord` and a key
 */
export const keyInRecord =
  (key: string) =>
  <S, A>(sa: Traversal<S, Readonly<Record<string, A>>>): Traversal<S, A> =>
    pipe(sa, compose(_.optionalAsTraversal(_.indexRecord<A>().index(key))))

/**
 * Return a `Traversal` from a `Traversal` focused on a `ReadonlyRecord` and a required key
 */
export const atKeyInRecord =
  (key: string) =>
  <S, A>(sa: Traversal<S, Readonly<Record<string, A>>>): Traversal<S, Option<A>> =>
    pipe(sa, compose(_.lensAsTraversal(_.atRecord<A>().at(key))))

/**
 * Return a `Traversal` from a `Traversal` focused on a `ReadonlyRecord` and a key
 */
export const keyInHashMap =
  <K = never>(key: K) =>
  <S, A>(sa: Traversal<S, Readonly<HashMap<K, A>>>): Traversal<S, A> =>
    pipe(sa, compose(_.optionalAsTraversal(_.indexHashMap<K, A>().index(key))))

/**
 * Return a `Traversal` from a `Traversal` focused on a `ReadonlyRecord` and a required key
 */
export const atKeyInHashMap =
  <K = never>(key: K) =>
  <S, A>(sa: Traversal<S, Readonly<HashMap<K, A>>>): Traversal<S, Option<A>> =>
    pipe(sa, compose(_.lensAsTraversal(_.atHashMap<K, A>().at(key))))

/**
 * Return a `Traversal` from a `Traversal` focused on the `Some` of a `Option` type
 */
export const some: <S, A>(soa: Traversal<S, Option<A>>) => Traversal<S, A> =
  /*#__PURE__*/
  compose(_.prismAsTraversal(_.prismSome()))

/**
 * Return a `Traversal` from a `Traversal` focused on the `Right` of a `Either` type
 */
export const right: <S, E, A>(sea: Traversal<S, Either<E, A>>) => Traversal<S, A> =
  /*#__PURE__*/
  compose(_.prismAsTraversal(_.prismRight()))

/**
 * Return a `Traversal` from a `Traversal` focused on the `Left` of a `Either` type
 */
export const left: <S, E, A>(sea: Traversal<S, Either<E, A>>) => Traversal<S, E> =
  compose(_.prismAsTraversal(_.prismLeft()))

/**
 * Return a `Traversal` from a `Traversal` focused on a `ForEach`
 */
export function forEach<T extends P.URIS, C = P.Auto>(
  T: P.ForEach<T, C>
): <TK, TQ, TW, TX, TI, TS, TR, TE, S, A>(
  sta: Traversal<S, P.Kind<T, C, TK, TQ, TW, TX, TI, TS, TR, TE, A>>
) => Traversal<S, A> {
  return compose(fromForEach(T)())
}

/**
 * Map each target to a `Monoid` and combine the results.
 */
export const foldMap = <M>(M: Identity<M>) => {
  const _ = C.getApplicative(M)
  return <A>(f: (a: A) => M) =>
    <S>(sa: Traversal<S, A>): ((s: S) => M) =>
      sa.modifyF(_)(f as any)
}

/**
 * Map each target to a `Monoid` and combine the results.
 */
export const fold = <A>(M: Identity<A>): (<S>(sa: Traversal<S, A>) => (s: S) => A) =>
  foldMap(M)(identity)

const unknownId = A.getIdentity<any>()

/**
 * Get all the targets of a `Traversal`.
 */
export const getAll =
  <S>(s: S) =>
  <A>(sa: Traversal<S, A>): ReadonlyArray<A> =>
    foldMap(unknownId)((a: A) => [a])(sa)(s)

const unknownIdList = L.getIdentity<any>()

/**
 * Get all the targets of a `Traversal`.
 */
export const getAllList =
  <S>(s: S) =>
  <A>(sa: Traversal<S, A>): L.List<A> =>
    foldMap(unknownIdList as Identity<L.List<A>>)(L.of as (a: A) => L.List<A>)(sa)(s)

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

export const TraversalURI = "monocle/Traversal"
export type TraversalURI = typeof TraversalURI

declare module "@effect-ts/core/Prelude/HKT" {
  export interface URItoKind<FC, TC, K, Q, W, X, I, S, R, E, A> {
    [TraversalURI]: Traversal<I, A>
  }
}

export const Category = P.instance<P.Category<[URI<TraversalURI>]>>({
  compose,
  id
})
