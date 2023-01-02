/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable unused-imports/no-unused-imports */

import "./global.ts"

import type * as MAP from "@effect-ts/core/Collections/Immutable/Map"
import type * as CNK from "@fp-ts/data/Chunk"
// import type * as CAUSE from "@effect-ts/core/Effect/Cause"
// import type * as EX from "@effect-ts/core/Effect/Exit"
// import type * as M from "@effect-ts/core/Effect/Managed"
// import type * as LAYER from "@effect-ts/core/Effect/Layer"
// import type * as FIBER from "@effect-ts/core/Effect/Fiber"
// import type * as REF from "@effect-ts/core/Effect/Ref"
// import type * as SEMAPHORE from "@effect-ts/core/Effect/Semaphore"
import type * as EQ from "@effect-ts/core/Equal"
import type * as ORD from "@effect-ts/core/Ord"
import type * as EITHER from "@fp-ts/data/Either"
// import type * as Sy from "@effect-ts-app/core/Sync"
// import type * as XPURE from "@effect-ts/core/XPure"
import type * as LNS from "@effect-ts/monocle/Lens"
// import type * as T from "@effect-ts-app/core/Effect"
// import type * as SCHEDULE from "@effect-ts/core/Effect/Schedule"
// import type * as QUEUE from "@effect-ts/core/Effect/Queue"
// import type * as EO from "@effect-ts-app/core/EffectOption"
import type * as NS from "@effect-ts-app/core/NonEmptySet"
import type * as O from "@fp-ts/data/Option"
// import type * as SCHEMA from "@effect-ts-app/schema"
import type * as SET from "@effect-ts-app/core/Set"
// import type * as SO from "@effect-ts-app/core/SyncOpt"
// import type * as HAS from "@effect-ts/core/Has"

import type {} from "@effect-ts-app/core/types/awesome"

/**
 * @tsplus type ReadonlyArray
 * @tsplus type Iterable
 * @tsplus companion fp-ts/data/ReadonlyArray.Ops
 * @tsplus companion fp-ts/data/ReadonlyArray.Ops
 */
export type ROA<A> = ReadonlyArray<A>
export type { ROA as ReadonlyArray }

export namespace Equal {
  // @ts-expect-error abc
  export * from "@effect-ts/core/Equal"
}
/** @tsplus type ets/Equal */
export type Equal<A> = EQ.Equal<A>

// export namespace Has {
//   export * from "@effect-ts/core/Has"
// }
// /** @tsplus type ets/Has */
// export type Has<T> = HAS.Has<T>

// /** @tsplus type ets/Tag */
// export type Tag<T> = HAS.Tag<T>

// /** @tsplus type ets/Fiber */
// export type Fiber<A, B> = FIBER.Fiber<A, B>
// export namespace Fiber {
//   export * from "@effect-ts/core/Effect/Fiber"
// }

// /** @tsplus type ets/Cause */
// export type Cause<A> = CAUSE.Cause<A>
// export namespace Cause {
//   export * from "@effect-ts/core/Effect/Cause"
// }

// export namespace Exit {
//   export * from "@effect-ts/core/Effect/Exit"
// }
// /** @tsplus type ets/Exit */
// export type Exit<E, A> = EX.Exit<E, A>

export namespace Either {
  // @ts-expect-error abc
  export * from "@fp-ts/data/Either"
}
/** @tsplus type fp-ts/data/Either */
export type Either<E, A> = EITHER.Either<E, A>

export namespace Ord {
  // @ts-expect-error abc
  export * from "@effect-ts/core/Ord"
}
/** @tsplus type ets/Ord */
export type Ord<A> = ORD.Ord<A>

// export namespace EffectOption {
//   export * from "@effect-ts-app/core/EffectOption"
// }
// /** @tsplus type ets/EffectOption */
// export type EffectOption<R, E, A> = EO.EffectOption<R, E, A>
// export { UIO as EffectOptionU, IO as EffectOptionE, RIO as EffectOptionR } from "@effect-ts-app/core/EffectOption"

// export namespace SyncOpt {
//   export * from "@effect-ts-app/core/SyncOpt"
// }
// /** @tsplus type ets/SyncOpt */
// export type SyncOpt<R, E, A> = SO.SyncOpt<R, E, A>
// export { UIO as SyncOptU, IO as SyncOptE, RIO as SyncOptR } from "@effect-ts-app/core/SyncOpt"

// export namespace Managed {
//   export * from "@effect-ts/core/Effect/Managed"
// }
// /** @tsplus type ets/Managed */
// export type Managed<R,E,A> = M.Managed<R, E, A>
// export { UIO as ManagedU, IO as ManagedE, RIO as ManagedR } from "@effect-ts/core/Effect/Managed"

// export namespace Effect {
//   export * from "@effect-ts-app/core/Effect"
// }
// /** @tsplus type ets/Effect */
// export type Effect<R,E,A> = T.Effect<R, E, A>
// export { UIO as EffectU, IO as EffectE, RIO as EffectR } from "@effect-ts-app/core/Effect"

// export namespace Schedule {
//   export * from "@effect-ts/core/Effect/Schedule"
// }
// /** @tsplus type ets/Schedule */
// export type Schedule<Env, In, Out> = SCHEDULE.Schedule<Env, In, Out>

export namespace Option {
  // @ts-expect-error abc
  export * from "@fp-ts/data/Option"
}
/**
 * @tsplus companion fp-ts/data/Option.Ops
 * @tsplus type fp-ts/data/Option
 */
export type Option<A> = O.Option<A>

export namespace Chunk {
  // @ts-expect-error abc
  export * from "@fp-ts/data/Chunk"
}
/**
 * @tsplus companion fp-ts/data/Chunk.Ops
 * @tsplus type fp-ts/data/Chunk
 */
export type Chunk<A> = CNK.Chunk<A>

// export namespace Sync {
//   export * from "@effect-ts-app/core/Sync"
// }

// /** @tsplus type ets/Sync */
// export type Sync<R, E, A> = Sy.Sync<R, E, A>
// export { UIO as SyncU, IO as SyncE, RIO as SyncR } from "@effect-ts-app/core/Sync"

// export namespace XPure {
//   export * from "@effect-ts/core/XPure"
// }

// /** @tsplus type ets/XPure */
// export type XPure<W, S1, S2, R, E, A> = XPURE.XPure<W, S1, S2, R, E, A>

// export namespace NonEmptyArray {
//   // @ts-expect-error
//   export * from "@effect-ts-app/core/NonEmptyArray"
// }
// /** @tsplus type fp-ts/data/ReadonlyArray.NonEmptyReadonlyArray */
// export type NonEmptyReadonlyArray<A> = NA.NonEmptyReadonlyArray<A>

export namespace NonEmptySet {
  // @ts-expect-error
  export * from "@effect-ts-app/core/NonEmptySet"
}
/** @tsplus type ets/NonEmptySet */
export type NonEmptySet<A> = NS.NonEmptySet<A>

// export namespace Array {
//   // @ts-expect-error
//   export * from "@effect-ts-app/core/Array"
// }
// /** @tsplus type Array */
// export type Array<A> = A.Array<A>

// export namespace ReadonlyArray {
//   // @ts-expect-error
//   export * from "@effect-ts-app/core/Array"
// }
// /** @tsplus type Array */
// export type ReadonlyArray<A> = A.Array<A>

export namespace Set {
  // @ts-expect-error
  export * from "@effect-ts-app/core/Set"
}
/** @tsplus type ets/Set */
export type Set<A> = SET.Set<A>

export namespace ROSet {
  // @ts-expect-error
  export * from "@effect-ts-app/core/Set"
}
/**
 * @tsplus type ets/Set
 * @tsplus type ets/ROSet
 */
export type ROSet<A> = SET.Set<A>

// export namespace Layer {
//   export * from "@effect-ts/core/Effect/Layer"
// }
// /** @tsplus type ets/Layer */
// export type Layer<RIn, E, ROut> = LAYER.Layer<RIn, E, ROut>

// export namespace Ref {
//   export * from "@effect-ts/core/Effect/Ref"
// }
// /** @tsplus type ets/Ref */
// export type Ref<A> = REF.Ref<A>

// export namespace Queue {
//   export * from "@effect-ts/core/Effect/Queue"
// }
// /** @tsplus type ets/Queue */
// export type Queue<A> = QUEUE.Queue<A>
// export { Enqueue, XEnqueue, Dequeue, XDequeue} from "@effect-ts/core/Effect/Queue"

// export namespace Semaphore {
//   export * from "@effect-ts/core/Effect/Semaphore"
// }
// /** @tsplus type ets/Semaphore */
// export type Semaphore = SEMAPHORE.Semaphore

export namespace Map {
  // @ts-expect-error
  export * from "@effect-ts/core/Collections/Immutable/Map"
}
/** @tsplus type ets/Map */
export type Map<K, A> = MAP.Map<K, A>

export namespace ROMap {
  // @ts-expect-error
  export * from "@effect-ts/core/Collections/Immutable/Map"
}
/** @tsplus type ets/Map */
export type ROMap<K, A> = MAP.Map<K, A>

export namespace Lens {
  // @ts-expect-error
  export * from "@effect-ts/monocle/Lens"
}
/** @tsplus type ets/Lens */
export type Lens<S, A> = LNS.Lens<S, A>

// export namespace Schema {
//   export * from "@effect-ts-app/schema"
// }
// export { DefaultSchema, SchemaUPI } from "@effect-ts-app/schema"
// /** @tsplus type ets/Schema/Schema */
// export type Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api> =
//   SCHEMA.Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>

export type NonEmptyArguments<T> = [T, ...T[]]
