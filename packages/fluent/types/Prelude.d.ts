import "@effect-ts/fluent/Prelude"

import type * as MAP from "@effect-ts/core/Collections/Immutable/Map"
import type * as CAUSE from "@effect-ts/core/Effect/Cause"
import type * as EX from "@effect-ts/core/Effect/Exit"
import type * as LAYER from "@effect-ts/core/Effect/Layer"
import type * as REF from "@effect-ts/core/Effect/Ref"
import type * as SEMAPHORE from "@effect-ts/core/Effect/Semaphore"
import type * as EITHER from "@effect-ts/core/Either"
import type * as EQ from "@effect-ts/core/Equal"
import type * as ORD from "@effect-ts/core/Ord"
//import type * as CNK from "@effect-ts/core/Collections/Immutable/Chunk"
import type * as Sy from "@effect-ts/core/Sync"
import type * as LNS from "@effect-ts/monocle/Lens"
import type * as T from "@effect-ts-app/core/Effect"
import type * as EO from "@effect-ts-app/core/EffectOption"
import type * as NA from "@effect-ts-app/core/NonEmptyArray"
import type * as O from "@effect-ts-app/core/Option"
import type * as SCHEMA from "@effect-ts-app/core/Schema"
import type * as SET from "@effect-ts-app/core/Set"
//import type * as O from "@effect-ts-app/core/Option"
import type * as SO from "@effect-ts-app/core/SyncOption"

declare global {
  export namespace $T {
    export const Exit = EX
    export { Exit } from "@effect-ts/core/Effect/Exit"
    export const Cause = CAUSE
    export { Cause } from "@effect-ts/core/Effect/Cause"
    export const Either = EITHER
    export { Either } from "@effect-ts/core/Either"
    export const Map = MAP
    export { Map } from "@effect-ts/core/Collections/Immutable/Map"

    export const Layer = LAYER
    export { Layer } from "@effect-ts/core/Effect/Layer"

    export const Ref = REF
    export { Ref } from "@effect-ts/core/Effect/Ref"

    export const Semaphore = SEMAPHORE
    export { Semaphore } from "@effect-ts/core/Effect/Semaphore"

    export const Equal = EQ
    export { Equal } from "@effect-ts/core/Equal"

    export const Ord = ORD
    export { Ord } from "@effect-ts/core/Equal"

    export const EffectOption = EO
    export { EffectOption } from "@effect-ts-app/core/EffectOption"
    export type EffectOptionU<A> = EO.EffectOption<unknown, never, A>
    export type EffectOptionE<E, A> = EO.EffectOption<unknown, E, A>
    export type EffectOptionR<R, A> = EO.EffectOption<R, never, A>

    export const SyncOption = SO
    export { SyncOption } from "@effect-ts-app/core/SyncOption"
    export type SyncOptionU<A> = SO.SyncOption<unknown, never, A>
    export type SyncOptionE<E, A> = SO.SyncOption<unknown, E, A>
    export type SyncOptionR<R, A> = SO.SyncOption<R, never, A>

    export const Effect = T
    export { Effect } from "@effect-ts-app/core/Effect"

    export const Option = O
    export { Option } from "@effect-ts-app/core/Option"

    export const Sync = Sy
    export { Sync } from "@effect-ts-app/core/Sync"
    export type SyncU<A> = Sy.Sync<unknown, never, A>
    export type SyncE<E, A> = Sy.Sync<unknown, E, A>
    export type SyncR<R, A> = Sy.Sync<R, never, A>

    export const NonEmptyArray = NA
    export { NonEmptyArray } from "@effect-ts-app/core/NonEmptyArray"

    export const Set = SET
    export { Set } from "@effect-ts-app/core/Set"

    export const Lens = LNS
    export { Lens } from "@effect-ts/monocle/Lens"

    export const Schema = SCHEMA
    export { Schema, DefaultSchema, SchemaUPI } from "@effect-ts-app/core/Schema"
  }
}

// declare module "@effect-ts/system/Option/core" {
//   interface OptionStaticOps extends O {}
//   const Option: OptionStaticOps
// }
