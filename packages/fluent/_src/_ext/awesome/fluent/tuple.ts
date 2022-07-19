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
import { mapN_ } from "@effect-ts/core/Effect"

/**
 * @tsplus fluent ets/Effect mapEffectN
 */
export const ext_mapN_ = mapN_

  // refactor tuple to use TupleOps
  namespace Tuple {
import { tuple } from "@effect-ts/core/Collections/Immutable/Tuple"

/**
 * @tsplus static ets/Tuple.Ops const
 */
export const ext_tuple = tuple

import { fromNative } from "@effect-ts/core/Collections/Immutable/Tuple"

/**
 * @tsplus static ets/Tuple.Ops const
 */
export const ext_fromNative = fromNative
