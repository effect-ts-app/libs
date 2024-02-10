/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * For namespace * exports to work, there must be a matching and USED `import type * as ` from the same file
 * We need to handle the real exports separately in another file (Prelude.code.ts)
 * and post build move the other file as .js counter part of this d.ts file.
 */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable unused-imports/no-unused-imports */

import "./global.js"

import type * as EFFECT from "@effect-app/core/Effect"
import type * as NS from "@effect-app/core/NonEmptySet"
import type * as SET from "@effect-app/core/Set"
import type * as LNS from "@fp-ts/optic"
import type * as CNK from "effect/Chunk"
import type * as EITHER from "effect/Either"
import type * as LAYER from "effect/Layer"
import type * as O from "effect/Option"
import type * as ORD from "effect/Order"

export type { NonEmptyArray } from "@effect-app/core/Array"

export namespace Effect {
  // @ts-expect-error abc
  export * from "@effect-app/core/Effect"
  export type Success<T extends Effect<any, any, any>> = EFFECT.Effect.Success<T>
  export type Error<T extends Effect<any, any, any>> = EFFECT.Effect.Error<T>
  export type Context<T extends Effect<any, any, any>> = EFFECT.Effect.Context<T>
}
export type Effect<A, E, R> = EFFECT.Effect<A, E, R>

export namespace Layer {
  // @ts-ignore
  export * from "effect/Layer"
  export type Success<T extends Layer<never, any, any>> = LAYER.Layer.Success<T>
  export type Error<T extends Layer<never, any, any>> = LAYER.Layer.Error<T>
  export type Context<T extends Layer<never, any, any>> = LAYER.Layer.Context<T>
}
export type Layer<ROut, E, RIn> = LAYER.Layer<ROut, E, RIn>

export namespace Either {
  // @ts-expect-error abc
  export * from "effect/Either"
}
/** @tsplus type effect/data/Either */
export type Either<E, A> = EITHER.Either<E, A>

export namespace Order {
  // @ts-expect-error abc
  export * from "effect/Order"
}
/** @tsplus type effect/data/Order */
export type Order<A> = ORD.Order<A>

export namespace Option {
  // @ts-expect-error abc
  export * from "effect/Option"
}
/**
 * @tsplus companion effect/data/Option.Ops
 * @tsplus type effect/data/Option
 */
export type Option<A> = O.Option<A>

export namespace Chunk {
  // @ts-expect-error abc
  export * from "effect/Chunk"
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

export namespace ReadonlyArray {
  // @ts-expect-error
  export * from "@effect-app/core/Array"
}
/**
 * @tsplus type ReadonlyArray
 * @tsplus type Iterable
 * @tsplus companion effect/data/ReadonlyArray.Ops
 * @tsplus companion effect/data/ReadonlyArray.Ops
 */
export type ReadonlyArray<A> = globalThis.ReadonlyArray<A>

// /**
//  * @tsplus type NonEmptyReadonlyArray
//  * @tsplus type Iterable
//  * @tsplus companion effect/data/NonEmptyReadonlyArray.Ops
//  * @tsplus companion effect/data/NonEmptyReadonlyArray.Ops
//  */
// export type NonEmptyReadonlyArray<A> = ARR.NonEmptyReadonlyArray<A>

export namespace ReadonlySet {
  // @ts-expect-error
  export * from "@effect-app/core/Set"
}
/**
 * @tsplus type ets/Set
 * @tsplus type ets/ReadonlySet
 */
export type ReadonlySet<A> = SET.Set<A>

export namespace Optic {
  // @ts-expect-error
  export * from "@effect-app/core/Optic"
}
export type Lens<S, A> = LNS.Lens<S, A>
