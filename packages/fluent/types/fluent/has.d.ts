// ets_tracing: off

import type { Layer } from "@effect-ts/core/Effect/Layer"
import type { DerivedFunctions } from "@effect-ts/core/Has"
import type { Compute, UnionToIntersection } from "@effect-ts/core/Utils"

declare module "@effect-ts/system/Has" {
  export interface Has<T> {
    /**
     * @ets_rewrite_method pipe from "smart:pipe"
     */
    pipe<Self, Ret>(this: Self, f: (self: Self) => Ret): Ret

    /**
     * @ets_rewrite_method succeed from "@effect-ts/core/Effect/Layer"
     */
    toLayer<AX>(this: Has<AX>): Layer<unknown, never, Has<AX>>
  }

  export interface Tag<T> {
    /**
     * @ets_rewrite_method pipe from "smart:pipe"
     */
    pipe<Self, Ret>(this: Self, f: (self: Self) => Ret): Ret

    /**
     * @ets_rewrite_method deriveFunctions from "@effect-ts/core/Has"
     */
    deriveLifted<TX, Ks extends readonly (keyof DerivedFunctions<TX>)[]>(
      this: Tag<TX>,
      ...keys: Ks
    ): Compute<
      UnionToIntersection<
        {
          [k in keyof Ks]: Ks[k] extends keyof DerivedFunctions<TX>
            ? {
                [H in Ks[k]]: DerivedFunctions<TX>[Ks[k]]
              }
            : never
        }[number]
      >,
      "flat"
    >
  }
}
