import "@effect-ts/fluent/Prelude"

import type * as EQ from "@effect-ts/core/Equal"
import type * as ORD from "@effect-ts/core/Ord"
//import type * as CNK from "@effect-ts/core/Collections/Immutable/Chunk"
import type * as Sy from "@effect-ts/core/Sync"
import type * as LNS from "@effect-ts/monocle/Lens"
import * as T from "@effect-ts-app/core/Effect"
import type * as EO from "@effect-ts-app/core/EffectOption"
import type * as NA from "@effect-ts-app/core/NonEmptyArray"
import type * as SCHEMA from "@effect-ts-app/core/Schema"
import type * as SET from "@effect-ts-app/core/Set"
//import type * as O from "@effect-ts-app/core/Option"
import type * as SO from "@effect-ts-app/core/SyncOption"

declare global {
  namespace $T {
    export const Equal = EQ
    export { Equal } from "@effect-ts/core/Equal"

    export const Ord = ORD
    export { Ord } from "@effect-ts/core/Equal"

    export const EffectOption = EO
    export { EffectOption } from "@effect-ts-app/core/EffectOption"

    export const SyncOption = SO
    export { SyncOption } from "@effect-ts-app/core/SyncOption"

    export const Effect = T
    export { Effect } from "@effect-ts-app/core/Effect"

    export const Sync = Sy
    export { Sync } from "@effect-ts-app/core/Sync"

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
