import "@effect-ts/fluent/Prelude"

import type * as EQ from "@effect-ts/core/Equal"
import type * as ORD from "@effect-ts/core/Ord"
import type * as LNS from "@effect-ts/monocle/Lens"
import type * as EO from "@effect-ts-app/core/EffectOption"

declare global {
  namespace $T {
    export const Equal = EQ
    export { Equal } from "@effect-ts/core/Equal"

    export const Ord = ORD
    export { Ord } from "@effect-ts/core/Equal"

    export const EffectOption = EO
    export { EffectOption } from "@effect-ts-app/core/EffectOption"

    export const Lens = LNS
    export { Lens } from "@effect-ts/monocle/Lens"
  }
}
