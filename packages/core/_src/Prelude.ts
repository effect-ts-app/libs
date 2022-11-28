//import type * as CNK from "@effect-ts-app/core/Chunk"
import type * as MAP from "@effect-ts/core/Collections/Immutable/Map"
// import type * as CAUSE from "@effect-ts/core/Effect/Cause"
// import type * as EX from "@effect-ts/core/Effect/Exit"
// import type * as M from "@effect-ts/core/Effect/Managed"
// import type * as LAYER from "@effect-ts/core/Effect/Layer"
// import type * as FIBER from "@effect-ts/core/Effect/Fiber"
// import type * as REF from "@effect-ts/core/Effect/Ref"
// import type * as SEMAPHORE from "@effect-ts/core/Effect/Semaphore"
// import type * as EITHER from "@effect-ts/core/Either"
// import type * as EQ from "@effect-ts/core/Equal"
// import type * as ORD from "@effect-ts/core/Ord"
// import type * as Sy from "@effect-ts-app/core/Sync"
// import type * as XPURE from "@effect-ts/core/XPure"
import type * as LNS from "@effect-ts/monocle/Lens"
// import type * as T from "@effect-ts-app/core/Effect"
// import type * as SCHEDULE from "@effect-ts/core/Effect/Schedule"
// import type * as QUEUE from "@effect-ts/core/Effect/Queue"
//import type * as EO from "@effect-ts-app/core/EffectMaybe"
import type * as NA from "@effect-ts-app/core/NonEmptyArray"
import type * as NS from "@effect-ts-app/core/NonEmptySet"
import type * as A from "@effect-ts-app/core/Array"
//import type * as O from "@effect-ts-app/core/Maybe"
//import type * as SCHEMA from "@effect-ts-app/schema"
import type * as SET from "@effect-ts-app/core/Set"
// import type * as SO from "@effect-ts-app/core/SyncMaybe"
// import type * as HAS from "@effect-ts/core/Has"
import type * as TUP from "@effect-ts/core/Collections/Immutable/Tuple"

import "@effect-ts-app/core/types/awesome"


// export namespace Equal {
//   export * from "@effect-ts/core/Equal"
// }
// /** @tsplus type ets/Equal */
// export type Equal<A> = EQ.Equal<A>

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

export namespace Tuple {
  // @ts-expect-error
  export * from "@effect-ts/core/Collections/Immutable/Tuple"
}
/** @tsplus type ets/Tuple */
export type Tuple<T extends readonly unknown[]> = TUP.Tuple<T>

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

// export namespace Either {
//   export * from "@effect-ts/core/Either"
// }
// /** @tsplus type ets/Either */
// export type Either<E, A> = EITHER.Either<E, A>

// export namespace Ord {
//   export * from "@effect-ts/core/Ord"
// }
// /** @tsplus type ets/Ord */
// export type Ord<A> = ORD.Ord<A>

// export namespace EffectMaybe {
//   export * from "@effect-ts-app/core/EffectMaybe"
// }
// /** @tsplus type ets/EffectMaybe */
// export type EffectMaybe<R, E, A> = EO.EffectMaybe<R, E, A>
// export { UIO as EffectMaybeU, IO as EffectMaybeE, RIO as EffectMaybeR } from "@effect-ts-app/core/EffectMaybe"

// export namespace SyncMaybe {
//   export * from "@effect-ts-app/core/SyncMaybe"
// }
// /** @tsplus type ets/SyncMaybe */
// export type SyncMaybe<R, E, A> = SO.SyncMaybe<R, E, A>
// export { UIO as SyncMaybeU, IO as SyncMaybeE, RIO as SyncMaybeR } from "@effect-ts-app/core/SyncMaybe"

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

// export namespace Maybe {
//   export * from "@effect-ts-app/core/Maybe"
// }
// /** @tsplus type ets/Maybe */
// export type Maybe<A> = O.Maybe<A>

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

export namespace NonEmptyArray {
  // @ts-expect-error
  export * from "@effect-ts-app/core/NonEmptyArray"
}
/** @tsplus type ets/NonEmptyArray */
export type NonEmptyArray<A> = NA.NonEmptyArray<A>

export namespace NonEmptySet {
  // @ts-expect-error
  export * from "@effect-ts-app/core/NonEmptySet"
}
/** @tsplus type ets/NonEmptySet */
export type NonEmptySet<A> = NS.NonEmptySet<A>

export namespace Array {
  // @ts-expect-error
  export * from "@effect-ts-app/core/Array"
}
/** @tsplus type ets/Array */
export type Array<A> = A.Array<A>

export namespace ROArray {
  // @ts-expect-error
  export * from "@effect-ts-app/core/Array"
}
/** @tsplus type ets/Array */
export type ROArray<A> = A.Array<A>

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
