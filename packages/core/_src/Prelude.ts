/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable unused-imports/no-unused-imports */

import "./global.js"

import type * as NS from "@effect-app/core/NonEmptySet"
import type * as SET from "@effect-app/core/Set"
import type * as CNK from "@effect/data/Chunk"
import type * as EITHER from "@effect/data/Either"
import type * as O from "@effect/data/Option"
import type * as ORD from "@effect/data/Order"
import type * as LNS from "@fp-ts/optic"

export namespace Either {
  // @ts-expect-error abc
  export * from "@effect/data/Either"
}
/** @tsplus type effect/data/Either */
export type Either<E, A> = EITHER.Either<E, A>

export namespace Order {
  // @ts-expect-error abc
  export * from "@effect/data/Order"
}
/** @tsplus type effect/data/Order */
export type Order<A> = ORD.Order<A>

export namespace Option {
  // @ts-expect-error abc
  export * from "@effect/data/Option"
}
/**
 * @tsplus companion effect/data/Option.Ops
 * @tsplus type effect/data/Option
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
 * @tsplus companion effect/data/ReadonlyArray.Ops
 * @tsplus companion effect/data/ReadonlyArray.Ops
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
