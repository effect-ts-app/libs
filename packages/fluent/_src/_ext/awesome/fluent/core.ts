// ets_tracing: off

import type * as A from "@effect-ts/core/Collections/Immutable/Array"
import type * as C from "@effect-ts/core/Collections/Immutable/Chunk"
import type * as T from "@effect-ts/core/Effect"
import type * as Ei from "@effect-ts/core/Either"
import type * as O from "@effect-ts/core/Option"
import type * as S from "@effect-ts/core/Sync"

declare global {
  interface ArrayConstructor extends ArrayStaticOps {}

  interface ArrayStaticOps {
    /**
     * @ets_rewrite_static getEqual from "@effect-ts/core/Collections/Immutable/Array"
     */
    getEqual: typeof A.getEqual
  }

  interface Array<T> extends ArrayOps {}

  interface ArrayOps extends ReadonlyArrayOps {
import { fromMutable } from "@effect-ts/core/Collections/Immutable/Array"

/**
 * @tsplus fluent ets/Array immutable
 */
export const ext_fromMutable = fromMutable

    /**
     * @ets_rewrite_method pipe from "smart:pipe"
     */
    pipe<Self, Ret>(this: Self, f: (self: Self) => Ret): Ret
import { mapSync_ } from "@effect-ts/core/Collections/Immutable/Array"

/**
 * @tsplus fluent ets/Array mapM
 */
export const ext_mapSync_ = mapSync_

import { mapEither_ } from "@effect-ts-app/fluent/fluent/Array"

/**
 * @tsplus fluent ets/Array mapM
 */
export const ext_mapEither_ = mapEither_

import { mapOption_ } from "@effect-ts-app/fluent/fluent/Array"

/**
 * @tsplus fluent ets/Array mapM
 */
export const ext_mapOption_ = mapOption_

import { mapEffect_ } from "@effect-ts/core/Collections/Immutable/Array"

/**
 * @tsplus fluent ets/Array mapM
 */
export const ext_mapEffect_ = mapEffect_

import { from } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk toChunk
 */
export const ext_from = from

  interface ReadonlyArray<T> extends ReadonlyArrayOps {}

  interface ReadonlyArrayOps {
import { toMutable } from "@effect-ts/core/Collections/Immutable/Array"

/**
 * @tsplus fluent ets/Array mutable
 */
export const ext_toMutable = toMutable

import { map_ } from "@effect-ts/core/Collections/Immutable/Array"

/**
 * @tsplus fluent ets/Array map
 */
export const ext_map_ = map_

    /**
     * @ets_rewrite_method pipe from "smart:pipe"
     */
    pipe<Self, Ret>(this: Self, f: (self: Self) => Ret): Ret
import { mapSync_ } from "@effect-ts/core/Collections/Immutable/Array"

/**
 * @tsplus fluent ets/Array mapM
 */
export const ext_mapSync_ = mapSync_

import { mapEither_ } from "@effect-ts-app/fluent/fluent/Array"

/**
 * @tsplus fluent ets/Array mapM
 */
export const ext_mapEither_ = mapEither_

import { mapOption_ } from "@effect-ts-app/fluent/fluent/Array"

/**
 * @tsplus fluent ets/Array mapM
 */
export const ext_mapOption_ = mapOption_

import { mapEffect_ } from "@effect-ts/core/Collections/Immutable/Array"

/**
 * @tsplus fluent ets/Array mapM
 */
export const ext_mapEffect_ = mapEffect_

import { from } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus fluent ets/Chunk toChunk
 */
export const ext_from = from
