import type * as CNK from "@effect-ts-app/core/Chunk"
import type * as MAP from "@effect-ts/core/Collections/Immutable/Map"
import type * as CAUSE from "@effect-ts/core/Effect/Cause"
import type * as EX from "@effect-ts/core/Effect/Exit"
import type * as M from "@effect-ts/core/Effect/Managed"
import type * as LAYER from "@effect-ts/core/Effect/Layer"
import type * as REF from "@effect-ts/core/Effect/Ref"
import type * as SEMAPHORE from "@effect-ts/core/Effect/Semaphore"
import type * as EITHER from "@effect-ts/core/Either"
import type * as EQ from "@effect-ts/core/Equal"
import type * as ORD from "@effect-ts/core/Ord"
import type * as Sy from "@effect-ts-app/core/Sync"
import type * as LNS from "@effect-ts/monocle/Lens"
import type * as T from "@effect-ts-app/core/Effect"
import type * as SCHEDULE from "@effect-ts/core/Effect/Schedule"
import type * as EO from "@effect-ts-app/core/EffectOption"
import type * as NA from "@effect-ts-app/core/NonEmptyArray"
import type * as A from "@effect-ts-app/core/Array"
import type * as O from "@effect-ts-app/core/Option"
import type * as SCHEMA from "@effect-ts-app/core/Schema"
import type * as SET from "@effect-ts-app/core/Set"
import type * as SO from "@effect-ts-app/core/SyncOption"
import type * as HAS from "@effect-ts/core/Has"
import type * as TUP from "@effect-ts-app/core/Tuple"

export namespace Equal {
  export * from "@effect-ts/core/Equal"
}
export type Equal<A> = EQ.Equal<A>

export namespace Has {
  export * from "@effect-ts/core/Has"
}
export type Has<T> = HAS.Has<T>

export namespace Tuple {
  export * from "@effect-ts-app/core/Tuple"
}
export type Tuple<T extends readonly unknown[]> = TUP.Tuple<T>

export type Cause<A> = CAUSE.Cause<A>
export namespace Cause {
  export * from "@effect-ts/core/Effect/Cause"
}

export namespace Exit {
  export * from "@effect-ts/core/Effect/Exit"
}
export type Exit<E, A> = EX.Exit<E, A>

export namespace Either {
  export * from "@effect-ts/core/Either"
}
export type Either<E, A> = EITHER.Either<E, A>

export namespace Ord {
  export * from "@effect-ts/core/Ord"
}
export type Ord<A> = ORD.Ord<A>

export namespace EffectOption {
  export * from "@effect-ts-app/core/EffectOption"
}
export type EffectOption<R, E, A> = EO.EffectOption<R, E, A>
export type EffectOptionU<A> = EO.EffectOption<unknown, never, A>
export type EffectOptionE<E, A> = EO.EffectOption<unknown, E, A>
export type EffectOptionR<R, A> = EO.EffectOption<R, never, A>

export namespace SyncOption {
  export * from "@effect-ts-app/core/SyncOption"
}
export type SyncOption<R, E, A> = SO.SyncOption<R, E, A>
export type SyncOptionU<A> = SO.SyncOption<unknown, never, A>
export type SyncOptionE<E, A> = SO.SyncOption<unknown, E, A>
export type SyncOptionR<R, A> = SO.SyncOption<R, never, A>

export namespace Managed {
  export * from "@effect-ts/core/Effect/Managed"
}
export type Managed<R,E,A> = M.Managed<R, E, A>

export namespace Effect {
  export * from "@effect-ts-app/core/Effect"
}
export type Effect<R,E,A> = T.Effect<R, E, A>
export type EffectU<A> = T.Effect<unknown, never, A>
export type EffectE<E, A> = T.Effect<unknown, E, A>
export type EffectR<R, A> = T.Effect<R, never, A>

export namespace Schedule {
  export * from "@effect-ts/core/Effect/Schedule"
}
export type Schedule<Env, In, Out> = SCHEDULE.Schedule<Env, In, Out>

export namespace Option {
  export * from "@effect-ts-app/core/Option"
}
export type Option<A> = O.Option<A>

export namespace Sync {
  //export { succeed as succeedNow, succeedWith as succeed, fail as failNow, failWith as fail } from "@effect-ts-app/core/Sync"
  export * from "@effect-ts-app/core/Sync"
}

export type Sync<R, E, A> = Sy.Sync<R, E, A>
export type SyncU<A> = Sy.Sync<unknown, never, A>
export type SyncE<E, A> = Sy.Sync<unknown, E, A>
export type SyncR<R, A> = Sy.Sync<R, never, A>

export namespace NonEmptyArray {
  export * from "@effect-ts-app/core/NonEmptyArray"
}
export type NonEmptyArray<A> = NA.NonEmptyArray<A>

export namespace Array {
  export * from "@effect-ts-app/core/Array"
}
export type Array<A> = A.Array<A>

export declare const Chunk = CNK
export type Chunk<A> = CNK.Chunk<A>

export declare const Set = SET
export type Set<A> = SET.Set<A>

export declare const Layer = LAYER
export type Layer<RIn, E, ROut> = LAYER.Layer<RIn, E, ROut>

export declare const Ref = REF
export type Ref<A> = REF.Ref<A>
export declare const Semaphore = SEMAPHORE
export type Semaphore = SEMAPHORE.Semaphore

export declare const Map = MAP
export type Map<K, A> = MAP.Map<K, A>

export namespace Lens {
  export * from "@effect-ts/monocle/Lens"
}
export type Lens<S, A> = LNS.Lens<S, A>

export declare const Schema = SCHEMA
export { DefaultSchema, SchemaUPI } from "@effect-ts-app/core/Schema"
export type Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api> =
  SCHEMA.Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
