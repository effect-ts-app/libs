import type { Effect } from "@effect-ts/core/Effect"
import type { XPure } from "@effect-ts/system/XPure"
import type { SyncOption } from "@effect-ts-app/core/SyncOption"

declare module "@effect-ts/system/Sync/core" {
  /**
   * @tsplus type ets/Sync
   */
  export interface Sync<R, E, A> extends XPure<unknown, unknown, unknown, R, E, A> {
import { toEffect } from "@effect-ts-app/core/Sync"

/**
 * @tsplus fluent ets/Sync toEffect
 */
export const ext_toEffect = toEffect

import { orDie } from "@effect-ts-app/core/Sync"

/**
 * @tsplus fluent ets/Sync orDie
 */
export const ext_orDie = orDie

import { chain_ } from "@effect-ts/core/Sync"

/**
 * @tsplus fluent ets/Sync chain
 */
export const ext_chain_ = chain_

    // Undo the selection for Effect for now.
    chain<RX, EX, AX, R2, E2, B>(
      this: Sync<RX, EX, AX>,
      f: (a: AX) => Effect<R2, E2, B>
    ): ["Not supported currently, use toEffect and chain", never]
import { map_ } from "@effect-ts/core/Sync"

/**
 * @tsplus fluent ets/Sync map
 */
export const ext_map_ = map_

import { mapError_ } from "@effect-ts/core/Sync"

/**
 * @tsplus fluent ets/Sync mapError
 */
export const ext_mapError_ = mapError_

import { map_ } from "@effect-ts-app/core/SyncOption"

/**
 * @tsplus fluent ets/SyncOption mapOption
 */
export const ext_map_ = map_

import { flatMap_ } from "@effect-ts-app/core/SyncOption"

/**
 * @tsplus fluent ets/SyncOption flatMapOption
 */
export const ext_flatMap_ = flatMap_

import { flatMapSync_ } from "@effect-ts-app/core/SyncOption"

/**
 * @tsplus fluent ets/SyncOption flatMapOptionSync
 */
export const ext_flatMapSync_ = flatMapSync_

import { toNullable } from "@effect-ts-app/core/SyncOption"

/**
 * @tsplus fluent ets/SyncOption toNullable
 */
export const ext_toNullable = toNullable

import { alt_ } from "@effect-ts-app/core/SyncOption"

/**
 * @tsplus fluent ets/SyncOption alt
 */
export const ext_alt_ = alt_

import { getOrElse_ } from "@effect-ts-app/core/SyncOption"

/**
 * @tsplus fluent ets/SyncOption getOrElse
 */
export const ext_getOrElse_ = getOrElse_

import { getOrFail_ } from "@effect-ts-app/core/SyncOption"

/**
 * @tsplus fluent ets/SyncOption getOrFail
 */
export const ext_getOrFail_ = getOrFail_
