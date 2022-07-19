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
import { succeed } from "@effect-ts/core/Effect/Layer"

/**
 * @tsplus fluent ets/Layer toLayer
 */
export const ext_succeed = succeed

  export interface Tag<T> {
    /**
     * @ets_rewrite_method pipe from "smart:pipe"
     */
    pipe<Self, Ret>(this: Self, f: (self: Self) => Ret): Ret
import { deriveFunctions } from "@effect-ts/core/Has"

/**
 * @tsplus fluent ets/Has deriveLifted
 */
export const ext_deriveFunctions = deriveFunctions
