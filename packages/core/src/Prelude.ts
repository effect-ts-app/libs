/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * For namespace * exports to work, there must be a matching and USED `import type * as ` from the same file
 * We need to handle the real exports separately in another file (Prelude.code.ts)
 * and post build move the other file as .js counter part of this d.ts file.
 */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable unused-imports/no-unused-imports */

import type * as CTX from "@effect-app/core/Context"
import type * as EFFECT from "@effect-app/core/Effect"
import type * as NS from "@effect-app/core/NonEmptySet"
import type * as SET from "@effect-app/core/Set"
import type * as C from "effect/Cause"
import type * as CNK from "effect/Chunk"
import type * as CFG from "effect/Config"
import type * as DUR from "effect/Duration"
import type * as EITHER from "effect/Either"
import type * as EQL from "effect/Equal"
import type * as EQ from "effect/Equivalence"
import type * as EX from "effect/Exit"
import type * as FR from "effect/FiberRef"
import type * as HM from "effect/HashMap"
import type * as LAYER from "effect/Layer"
import type * as O from "effect/Option"
import type * as ORD from "effect/Order"
import type * as REF from "effect/Ref"
import type * as SCHEMA from "effect/Schema"
import type * as SCOPE from "effect/Scope"

export type { NonEmptyArray, NonEmptyReadonlyArray } from "@effect-app/core/Array"

export namespace Effect {
  // @ts-expect-error abc
  export * from "@effect-app/core/Effect"
  export type Success<T extends Effect<any, any, any>> = EFFECT.Effect.Success<T>
  export type Error<T extends Effect<any, any, any>> = EFFECT.Effect.Error<T>
  export type Context<T extends Effect<any, any, any>> = EFFECT.Effect.Context<T>
}
export type Effect<out A, out E = never, out R = never> = EFFECT.Effect<A, E, R>

export namespace Layer {
  // @ts-ignore
  export * from "effect/Layer"
  export type Success<T extends Layer<never, any, any>> = LAYER.Layer.Success<T>
  export type Error<T extends Layer<never, any, any>> = LAYER.Layer.Error<T>
  export type Context<T extends Layer<never, any, any>> = LAYER.Layer.Context<T>
}
export type Layer<in ROut, out E = never, out RIn = never> = LAYER.Layer<ROut, E, RIn>

export namespace Either {
  // @ts-expect-error abc
  export * from "effect/Either"
}
/** @tsplus type effect/data/Either */
export type Either<R, L = never> = EITHER.Either<R, L>

export namespace Order {
  // @ts-expect-error abc
  export * from "effect/Order"
}
/** @tsplus type effect/data/Order */
export type Order<in A> = ORD.Order<A>

export namespace Ref {
  // @ts-expect-error abc
  export * from "effect/Ref"
}
/** @tsplus type effect/data/Ref */
export type Ref<in out A> = REF.Ref<A>

export namespace Duration {
  // @ts-expect-error abc
  export * from "effect/Duration"
}
/** @tsplus type effect/data/Duration */
export type Duration = DUR.Duration

export namespace Context {
  // @ts-expect-error abc
  export * from "@effect-app/core/Context"
}
/** @tsplus type effect/data/Context */
export type Context<in Services> = CTX.Context<Services>

export namespace FiberRef {
  // @ts-expect-error abc
  export * from "effect/FiberRef"
}
/** @tsplus type effect/data/FiberRef */
export type FiberRef<in out A> = FR.FiberRef<A>

export namespace Cause {
  // @ts-expect-error abc
  export * from "effect/Cause"
}
/** @tsplus type effect/data/Cause */
export type Cause<A> = C.Cause<A>

export namespace Exit {
  // @ts-expect-error abc
  export * from "effect/Exit"
}
/** @tsplus type effect/data/Exit */
export type Exit<A, E = never> = EX.Exit<A, E>

export namespace HashMap {
  // @ts-expect-error abc
  export * from "effect/HashMap"
}
/** @tsplus type effect/data/HashMap */
export type HashMap<out Key, out Value> = HM.HashMap<Key, Value>

export namespace Scope {
  // @ts-expect-error abc
  export * from "effect/Scope"
}
/** @tsplus type effect/data/Scope */
export type Scope = SCOPE.Scope

export namespace Option {
  // @ts-expect-error abc
  export * from "effect/Option"
}
/**
 * @tsplus companion effect/data/Option.Ops
 * @tsplus type effect/data/Option
 */
export type Option<A> = O.Option<A>

export namespace Equivalence {
  // @ts-expect-error abc
  export * from "effect/Equivalence"
}
export type Equivalence<in A> = EQ.Equivalence<A>

export namespace Config {
  // @ts-expect-error abc
  export * from "effect/Config"
}
export type Config<out A> = CFG.Config<A>

export namespace Equal {
  // @ts-expect-error abc
  export * from "effect/Equal"
}
export type Equal = EQL.Equal

export namespace Chunk {
  // @ts-expect-error abc
  export * from "effect/Chunk"
}
/**
 * @tsplus companion effect/data/Chunk.Ops
 * @tsplus type effect/data/Chunk
 */
export type Chunk<out A> = CNK.Chunk<A>

export namespace NonEmptySet {
  // @ts-expect-error
  export * from "@effect-app/core/NonEmptySet"
}
/** @tsplus type ets/NonEmptySet */
export type NonEmptySet<A> = NS.NonEmptySet<A>

export namespace Record {
  // @ts-expect-error
  export * from "@effect-app/core/Record"
}
/**
 * @tsplus type Record
 * @tsplus type Iterable
 * @tsplus companion effect/data/Record.Ops
 * @tsplus companion effect/data/Record.Ops
 */
export type Record<K extends string | symbol | number, V> = globalThis.Record<K, V>

export namespace Array {
  // @ts-expect-error
  export * from "@effect-app/core/Array"
}
/**
 * @tsplus type Array
 * @tsplus type Iterable
 * @tsplus companion effect/data/Array.Ops
 * @tsplus companion effect/data/Array.Ops
 */
export type Array<A> = globalThis.ReadonlyArray<A>

// /**
//  * @tsplus type NonEmptyReadonlyArray
//  * @tsplus type Iterable
//  * @tsplus companion effect/data/NonEmptyArray.Ops
//  * @tsplus companion effect/data/NonEmptyArray.Ops
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

export namespace Schema {
  // @ts-expect-error
  export * from "effect/Schema"
  export type Type<S> = SCHEMA.Schema.Type<S>
  export type Encoded<S> = SCHEMA.Schema.Encoded<S>
  export type Context<S> = SCHEMA.Schema.Context<S>
}

/**
 * @tsplus type ets/Set
 * @tsplus type ets/Schema
 */
export type Schema<in out A, in out I = A, out R = never> = SCHEMA.Schema<A, I, R>
