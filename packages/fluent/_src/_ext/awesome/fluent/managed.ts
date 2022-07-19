/* eslint-disable @typescript-eslint/no-namespace */
// ets_tracing: off

import type * as T from "@effect-ts/core/Effect"
import type { Cause } from "@effect-ts/core/Effect/Cause"
import type { Layer } from "@effect-ts/core/Effect/Layer"
import type * as M from "@effect-ts/core/Effect/Managed"
import type { Has, Tag } from "@effect-ts/system/Has"

declare module "@effect-ts/system/Managed/managed" {
  export interface ManagedStaticOps {
import { pipe } from "@effect-ts/core/Effect/Managed"

/**
 * @tsplus fluent ets/Managed gen
 */
export const ext_pipe = pipe

import { makeExit_ } from "@effect-ts/core/Effect/Managed"

/**
 * @tsplus fluent ets/Managed makeExit
 */
export const ext_makeExit_ = makeExit_

  export const Managed: ManagedStaticOps

  export interface Managed<R, E, A> extends ManagedOps {}

  export interface ManagedOps {
    /**
     * @ets_rewrite_method pipe from "smart:pipe"
     */
    pipe<Self, Ret>(this: Self, f: (self: Self) => Ret): Ret
import { as_ } from "@effect-ts/core/Effect/Managed"

/**
 * @tsplus fluent ets/Managed as
 */
export const ext_as_ = as_

import { map_ } from "@effect-ts/core/Effect/Managed"

/**
 * @tsplus fluent ets/Managed map
 */
export const ext_map_ = map_

import { chain_ } from "@effect-ts/core/Effect/Managed"

/**
 * @tsplus fluent ets/Managed chain
 */
export const ext_chain_ = chain_

import { tapM_ } from "@effect-ts/core/Effect/Managed"

/**
 * @tsplus fluent ets/Managed tap
 */
export const ext_tapM_ = tapM_

import { tap_ } from "@effect-ts/core/Effect/Managed"

/**
 * @tsplus fluent ets/Managed tap
 */
export const ext_tap_ = tap_

import { tapError_ } from "@effect-ts/core/Effect/Managed"

/**
 * @tsplus fluent ets/Managed tapError
 */
export const ext_tapError_ = tapError_

import { tapCause_ } from "@effect-ts/core/Effect/Managed"

/**
 * @tsplus fluent ets/Managed tapCause
 */
export const ext_tapCause_ = tapCause_

import { tapBoth_ } from "@effect-ts/core/Effect/Managed"

/**
 * @tsplus fluent ets/Managed tapBoth
 */
export const ext_tapBoth_ = tapBoth_

import { catchAll_ } from "@effect-ts/core/Effect/Managed"

/**
 * @tsplus fluent ets/Managed catchAll
 */
export const ext_catchAll_ = catchAll_

import { use_ } from "@effect-ts/core/Effect/Managed"

/**
 * @tsplus fluent ets/Managed use
 */
export const ext_use_ = use_

import { fromRawManaged } from "@effect-ts/core/Effect/Layer"

/**
 * @tsplus fluent ets/Layer toLayer
 */
export const ext_fromRawManaged = fromRawManaged

import { fromManaged_ } from "@effect-ts/core/Effect/Layer"

/**
 * @tsplus fluent ets/Layer toLayer
 */
export const ext_fromManaged_ = fromManaged_
