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
import type * as C from "effect/Cause"
import type * as CNK from "effect/Chunk"
import type * as CFG from "effect/Config"
import type * as CTX from "effect/Context"
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
import type * as SCOPE from "effect/Scope"

export type { NonEmptyArray, NonEmptyReadonlyArray } from "@effect-app/core/Array"

export namespace Effect {
  // @ts-expect-error abc
  export * from "@effect-app/core/Effect"
  export type Success<T extends Effect<any, any, any>> = EFFECT.Effect.Success<T>
  export type Error<T extends Effect<any, any, any>> = EFFECT.Effect.Error<T>
  export type Context<T extends Effect<any, any, any>> = EFFECT.Effect.Context<T>
}
export type Effect<A, E = never, R = never> = EFFECT.Effect<A, E, R>

export namespace Layer {
  // @ts-ignore
  export * from "effect/Layer"
  export type Success<T extends Layer<never, any, any>> = LAYER.Layer.Success<T>
  export type Error<T extends Layer<never, any, any>> = LAYER.Layer.Error<T>
  export type Context<T extends Layer<never, any, any>> = LAYER.Layer.Context<T>
}
export type Layer<ROut, E = never, RIn = never> = LAYER.Layer<ROut, E, RIn>

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
export type Order<A> = ORD.Order<A>

export namespace Ref {
  // @ts-expect-error abc
  export * from "effect/Ref"
}
/** @tsplus type effect/data/Ref */
export type Ref<A> = REF.Ref<A>

export namespace Context {
  // @ts-expect-error abc
  export * from "effect/Context"
}
/** @tsplus type effect/data/Context */
export type Context<A> = CTX.Context<A>

export namespace FiberRef {
  // @ts-expect-error abc
  export * from "effect/FiberRef"
}
/** @tsplus type effect/data/FiberRef */
export type FiberRef<A> = FR.FiberRef<A>

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
export type Equivalence<A> = EQ.Equivalence<A>

export namespace Config {
  // @ts-expect-error abc
  export * from "effect/Config"
}
export type Config<A> = CFG.Config<A>

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
