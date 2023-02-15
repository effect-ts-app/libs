/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable unused-imports/no-unused-imports */

import "./global.js"

import type * as NS from "@effect-app/core/NonEmptySet"
import type * as ORD from "@effect-app/core/Order"
import type * as SET from "@effect-app/core/Set"
import type * as CNK from "@effect/data/Chunk"
import type * as EITHER from "@fp-ts/core/Either"
import type * as O from "@fp-ts/core/Option"
import type * as LNS from "@fp-ts/optic"

export namespace Either {
  // @ts-expect-error abc
  export * from "@fp-ts/core/Either"
}
/** @tsplus type fp-ts/core/Either */
export type Either<E, A> = EITHER.Either<E, A>

export namespace Order {
  // @ts-expect-error abc
  export * from "@effect-app/core/Order"
}
/** @tsplus type fp-ts/core/typeclass/Order */
export type Order<A> = ORD.Order<A>

export namespace Option {
  // @ts-expect-error abc
  export * from "@fp-ts/core/Option"
}
/**
 * @tsplus companion fp-ts/core/Option.Ops
 * @tsplus type fp-ts/core/Option
 */
export type Option<A> = O.Option<A>

export namespace Chunk {
  // @ts-expect-error abc
  export * from "@effect/data/Chunk"
}
/**
 * @tsplus companion effect/data/Chunk.Ops
 * @tsplus type effect/data/Chunk
 */
export type Chunk<A> = CNK.Chunk<A>

export namespace NonEmptySet {
  // @ts-expect-error
  export * from "@effect-app/core/NonEmptySet"
}
/** @tsplus type ets/NonEmptySet */
export type NonEmptySet<A> = NS.NonEmptySet<A>

export namespace ROArray {
  // @ts-expect-error
  export * from "@effect-app/core/Array"
}
/**
 * @tsplus type ReadonlyArray
 * @tsplus type Iterable
 * @tsplus companion fp-ts/core/ReadonlyArray.Ops
 * @tsplus companion fp-ts/core/ReadonlyArray.Ops
 */
export type ROArray<A> = ReadonlyArray<A>

// export namespace ReadonlyArray {
//   // @ts-expect-error
//   export * from "@effect-app/core/Array"
// }
// /** @tsplus type Array */
// export type ReadonlyArray<A> = A.Array<A>

export namespace Set {
  // @ts-expect-error
  export * from "@effect-app/core/Set"
}
/** @tsplus type ets/Set */
export type Set<A> = SET.Set<A>

export namespace ROSet {
  // @ts-expect-error
  export * from "@effect-app/core/Set"
}
/**
 * @tsplus type ets/Set
 * @tsplus type ets/ROSet
 */
export type ROSet<A> = SET.Set<A>

export namespace Optic {
  // @ts-expect-error
  export * from "@effect-app/core/Optic"
}
export type Lens<S, A> = LNS.Lens<S, A>

export type NonEmptyArguments<T> = [T, ...T[]]
