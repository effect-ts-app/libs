//import "@effect-ts/fluent/Prelude"

import * as CNK from "@effect-ts/core/Collections/Immutable/Chunk"
import * as MAP from "@effect-ts/core/Collections/Immutable/Map"
import * as CAUSE from "@effect-ts/core/Effect/Cause"
import * as EX from "@effect-ts/core/Effect/Exit"
import * as LAYER from "@effect-ts/core/Effect/Layer"
import * as REF from "@effect-ts/core/Effect/Ref"
import * as SEMAPHORE from "@effect-ts/core/Effect/Semaphore"
import * as EITHER from "@effect-ts/core/Either"
import * as EQ from "@effect-ts/core/Equal"
import * as ORD from "@effect-ts/core/Ord"
import * as Sy from "@effect-ts/core/Sync"
import * as LNS from "@effect-ts/monocle/Lens"
import * as T from "@effect-ts-app/core/Effect"
import * as EO from "@effect-ts-app/core/EffectOption"
import * as NA from "@effect-ts-app/core/NonEmptyArray"
import * as O from "@effect-ts-app/core/Option"
import * as SCHEMA from "@effect-ts-app/core/Schema"
import * as SET from "@effect-ts-app/core/Set"
import * as SO from "@effect-ts-app/core/SyncOption"

// not sure if these consts can be tree shaked by Webpack etc ;-)
// an alternative could be to use a d.ts + manual .js file?

// TODO: with namespaces things just get better as they can include also Types
//export const Equal = EQ
// eslint-disable-next-line @typescript-eslint/no-namespace
// export namespace Equal {
//   export const { both, contramap } = EQ

//   export type Equal<A> = EQ.Equal<A>
// }
export const Equal = EQ
export type Equal<A> = EQ.Equal<A>

export const Cause = CAUSE
export type Cause<A> = CAUSE.Cause<A>

export const Exit = EX
export type Exit<E, A> = EX.Exit<E, A>

export const Either = EITHER
export type Either<E, A> = EITHER.Either<E, A>

export const Ord = ORD
export type Ord<A> = ORD.Ord<A>

export const EffectOption = EO
export type EffectOption<R, E, A> = EO.EffectOption<R, E, A>
export type EffectOptionU<A> = EO.EffectOption<unknown, never, A>
export type EffectOptionE<E, A> = EO.EffectOption<unknown, E, A>
export type EffectOptionR<R, A> = EO.EffectOption<R, never, A>

export const SyncOption = SO
export type SyncOption<R, E, A> = SO.SyncOption<R, E, A>
export type SyncOptionU<A> = SO.SyncOption<unknown, never, A>
export type SyncOptionE<E, A> = SO.SyncOption<unknown, E, A>
export type SyncOptionR<R, A> = SO.SyncOption<R, never, A>

export const Effect = T
export type Effect<R, E, A> = T.Effect<R, E, A>
export type EffectU<A> = T.Effect<unknown, never, A>
export type EffectE<E, A> = T.Effect<unknown, E, A>
export type EffectR<R, A> = T.Effect<R, never, A>

export const Option = O
export type Option<A> = O.Option<A>

export const Sync = Sy
export type Sync<R, E, A> = Sy.Sync<R, E, A>
export type SyncU<A> = Sy.Sync<unknown, never, A>
export type SyncE<E, A> = Sy.Sync<unknown, E, A>
export type SyncR<R, A> = Sy.Sync<R, never, A>

export const NonEmptyArray = NA
export type NonEmptyArray<A> = NA.NonEmptyArray<A>

export const Chunk = CNK
export type Chunk<A> = CNK.Chunk<A>

export const Set = SET
export type Set<A> = SET.Set<A>

export const Layer = LAYER
export type Layer<RIn, E, ROut> = LAYER.Layer<RIn, E, ROut>

export const Ref = REF
export type Ref<A> = REF.Ref<A>
export const Semaphore = SEMAPHORE
export type Semaphore = SEMAPHORE.Semaphore

export const Map = MAP
export type Map<K, A> = MAP.Map<K, A>

export const Lens = LNS
export type Lens<S, A> = LNS.Lens<S, A>

export const Schema = SCHEMA
export { DefaultSchema, SchemaUPI } from "@effect-ts-app/core/Schema"
export type Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api> =
  SCHEMA.Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
