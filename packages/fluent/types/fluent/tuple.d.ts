/* eslint-disable @typescript-eslint/no-namespace */

import type { NonEmptyArray } from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import type { Effect } from "@effect-ts/core/Effect"
import type { _A, _E, _R, ForcedArray } from "@effect-ts/core/Utils"
import type * as Tp from "@effect-ts/system/Collections/Immutable/Tuple"

declare module "@effect-ts/system/Collections/Immutable/Tuple" {
  interface Tuple<T extends readonly unknown[]> {
    /**
     * @ets_rewrite_method pipe from "smart:pipe"
     */
    pipe<Self, Ret>(this: Self, f: (self: Self) => Ret): Ret

    /**
     * @ets_rewrite_method mapN_ from "@effect-ts/core/Effect"
     */
    mapEffectN<T extends NonEmptyArray<Effect<any, any, any>>, B>(
      this: Tuple<T>,
      f: (
        ..._: ForcedArray<{
          [k in keyof T]: _A<T[k]>
        }>
      ) => B,
      __trace?: string
    ): Effect<_R<T[number]>, _E<T[number]>, B>
  }

  // refactor tuple to use TupleOps
  namespace Tuple {
    /**
     * @ets_rewrite_static tuple from "@effect-ts/core/Collections/Immutable/Tuple"
     */
    const tuple: typeof Tp.tuple

    /**
     * @ets_rewrite_static fromNative from "@effect-ts/core/Collections/Immutable/Tuple"
     */
    const fromNative: typeof Tp.fromNative
  }
}
