/* eslint-disable @typescript-eslint/no-unused-vars */
// ets_tracing: off
import type { NonEmptyArray } from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import type { Either } from "@effect-ts/core/Either"
import type { Equal } from "@effect-ts/core/Equal"
import type { Predicate, Refinement } from "@effect-ts/core/Function"
import type { Option } from "@effect-ts/core/Option"
import type { Ord } from "@effect-ts/core/Ord"
import type * as ARR from "@effect-ts-app/core/Array"
import type { Chunk } from "@effect-ts-app/core/Chunk"
import type { Effect } from "@effect-ts-app/core/Effect"
import type * as SET from "@effect-ts-app/core/Set"
import type { Sync } from "@effect-ts-app/core/Sync"

interface AOps {
import { map_ } from "@effect-ts/core/Collections/Immutable/NonEmptyArray"

/**
 * @tsplus fluent ets/NonEmptyArray mapRA
 */
export const ext_map_ = map_

import { mapWithIndex_ } from "@effect-ts-app/core/Array"

/**
 * @tsplus fluent ets/Array mapWithIndex
 */
export const ext_mapWithIndex_ = mapWithIndex_

import { concat_ } from "@effect-ts-app/core/Array"

/**
 * @tsplus fluent ets/Array concatRA
 */
export const ext_concat_ = concat_

import { concat_ } from "@effect-ts-app/core/Array"

/**
 * @tsplus fluent ets/Array concatRA
 */
export const ext_concat_ = concat_

import { sort_ } from "@effect-ts-app/fluent/_ext/Array"

/**
 * @tsplus fluent ets/Array sortWith
 */
export const ext_sort_ = sort_

import { sort_ } from "@effect-ts-app/fluent/_ext/Array"

/**
 * @tsplus fluent ets/Array sortWith
 */
export const ext_sort_ = sort_

import { sortBy_ } from "@effect-ts-app/fluent/_ext/Array"

/**
 * @tsplus fluent ets/Array sortBy
 */
export const ext_sortBy_ = sortBy_

import { append_ } from "@effect-ts-app/core/Array"

/**
 * @tsplus fluent ets/Array append
 */
export const ext_append_ = append_

import { append_ } from "@effect-ts-app/core/Array"

/**
 * @tsplus fluent ets/Array append
 */
export const ext_append_ = append_

  // replacement for mapM
import { mapEffect_ } from "@effect-ts-app/core/Array"

/**
 * @tsplus fluent ets/Array mapEffect
 */
export const ext_mapEffect_ = mapEffect_

import { mapSync_ } from "@effect-ts-app/core/Array"

/**
 * @tsplus fluent ets/Array mapSync
 */
export const ext_mapSync_ = mapSync_

import { mapEither_ } from "@effect-ts-app/fluent/fluent/Array"

/**
 * @tsplus fluent ets/Array mapEither
 */
export const ext_mapEither_ = mapEither_

import { mapEither_ } from "@effect-ts-app/fluent/fluent/Array"

/**
 * @tsplus fluent ets/Array mapEither
 */
export const ext_mapEither_ = mapEither_

import { mapOption_ } from "@effect-ts-app/fluent/fluent/Array"

/**
 * @tsplus fluent ets/Array mapOption
 */
export const ext_mapOption_ = mapOption_

import { mapOption_ } from "@effect-ts-app/fluent/fluent/Array"

/**
 * @tsplus fluent ets/Array mapOption
 */
export const ext_mapOption_ = mapOption_

import { mapEffect_ } from "@effect-ts-app/core/Array"

/**
 * @tsplus fluent ets/Array mapM
 */
export const ext_mapEffect_ = mapEffect_

import { mapEffect_ } from "@effect-ts-app/core/Array"

/**
 * @tsplus fluent ets/Array mapM
 */
export const ext_mapEffect_ = mapEffect_

import { mapM_ } from "@effect-ts-app/fluent/_ext/mapM"

/**
 * @tsplus fluent ets/mapM mapM
 */
export const ext_mapM_ = mapM_

import { mapM_ } from "@effect-ts-app/fluent/_ext/mapM"

/**
 * @tsplus fluent ets/mapM mapM
 */
export const ext_mapM_ = mapM_

import { mapEffect_ } from "@effect-ts-app/core/Array"

/**
 * @tsplus fluent ets/Array mapM
 */
export const ext_mapEffect_ = mapEffect_

import { mapEffect_ } from "@effect-ts-app/core/Array"

/**
 * @tsplus fluent ets/Array mapM
 */
export const ext_mapEffect_ = mapEffect_

import { mapM_ } from "@effect-ts-app/fluent/_ext/mapM"

/**
 * @tsplus fluent ets/mapM mapM
 */
export const ext_mapM_ = mapM_

import { mapM_ } from "@effect-ts-app/fluent/_ext/mapM"

/**
 * @tsplus fluent ets/mapM mapM
 */
export const ext_mapM_ = mapM_

import { flatten } from "@effect-ts-app/core/Array"

/**
 * @tsplus fluent ets/Array flatten
 */
export const ext_flatten = flatten

import { collect_ } from "@effect-ts-app/core/Array"

/**
 * @tsplus fluent ets/Array collect
 */
export const ext_collect_ = collect_

import { find_ } from "@effect-ts-app/core/Array"

/**
 * @tsplus fluent ets/Array findFirst
 */
export const ext_find_ = find_

import { findFirstMap_ } from "@effect-ts-app/core/Array"

/**
 * @tsplus fluent ets/Array findFirstMap
 */
export const ext_findFirstMap_ = findFirstMap_

import { filter_ } from "@effect-ts-app/core/Array"

/**
 * @tsplus fluent ets/Array filterRA
 */
export const ext_filter_ = filter_

import { filter_ } from "@effect-ts-app/core/Array"

/**
 * @tsplus fluent ets/Array filterRA
 */
export const ext_filter_ = filter_

import { uniq_ } from "@effect-ts-app/fluent/_ext/Array"

/**
 * @tsplus fluent ets/Array uniq
 */
export const ext_uniq_ = uniq_

import { head } from "@effect-ts-app/core/Array"

/**
 * @tsplus fluent ets/Array head
 */
export const ext_head = head

import { last } from "@effect-ts-app/core/Array"

/**
 * @tsplus fluent ets/Array last
 */
export const ext_last = last

import { tail } from "@effect-ts-app/core/Array"

/**
 * @tsplus fluent ets/Array tail
 */
export const ext_tail = tail

interface SOps {
import { filter_ } from "@effect-ts/core/Collections/Immutable/Set"

/**
 * @tsplus fluent ets/Set filter
 */
export const ext_filter_ = filter_

import { some_ } from "@effect-ts/core/Collections/Immutable/Set"

/**
 * @tsplus fluent ets/Set some
 */
export const ext_some_ = some_

import { find_ } from "@effect-ts-app/fluent/_ext/Set"

/**
 * @tsplus fluent ets/Set find
 */
export const ext_find_ = find_

import { findFirst_ } from "@effect-ts-app/fluent/_ext/Set"

/**
 * @tsplus fluent ets/Set findFirst
 */
export const ext_findFirst_ = findFirst_

import { findFirstMap_ } from "@effect-ts-app/fluent/_ext/Set"

/**
 * @tsplus fluent ets/Set findFirstMap
 */
export const ext_findFirstMap_ = findFirstMap_

interface IterableOps {
import { forEachParN_ } from "@effect-ts-app/core/Effect"

/**
 * @tsplus fluent ets/Effect forEachParN
 */
export const ext_forEachParN_ = forEachParN_

import { forEachPar_ } from "@effect-ts-app/core/Effect"

/**
 * @tsplus fluent ets/Effect forEachPar
 */
export const ext_forEachPar_ = forEachPar_

import { forEach_ } from "@effect-ts-app/core/Effect"

/**
 * @tsplus fluent ets/Effect forEachEffect
 */
export const ext_forEach_ = forEach_

import { collectAll } from "@effect-ts-app/core/Effect"

/**
 * @tsplus fluent ets/Effect collectAll
 */
export const ext_collectAll = collectAll

import { forEach_ } from "@effect-ts-app/core/Sync"

/**
 * @tsplus fluent ets/Sync forEachSync
 */
export const ext_forEach_ = forEach_

import { collectAll } from "@effect-ts-app/core/Sync"

/**
 * @tsplus fluent ets/Sync collectAllSync
 */
export const ext_collectAll = collectAll

import { from } from "@effect-ts-app/core/Chunk"

/**
 * @tsplus fluent ets/Chunk toChunk
 */
export const ext_from = from

declare module "@effect-ts/system/Collections/Immutable/Chunk" {
  interface ChunkOps extends IterableOps {
    // TYPO FIX
import { concat_ } from "@effect-ts-app/core/Chunk"

/**
 * @tsplus fluent ets/Chunk concat
 */
export const ext_concat_ = concat_

import { filter_ } from "@effect-ts-app/core/Chunk"

/**
 * @tsplus fluent ets/Chunk filter
 */
export const ext_filter_ = filter_

import { filter_ } from "@effect-ts-app/core/Chunk"

/**
 * @tsplus fluent ets/Chunk filter
 */
export const ext_filter_ = filter_

import { map_ } from "@effect-ts-app/core/Chunk"

/**
 * @tsplus fluent ets/Chunk map
 */
export const ext_map_ = map_

import { collect_ } from "@effect-ts-app/core/Chunk"

/**
 * @tsplus fluent ets/Chunk collect
 */
export const ext_collect_ = collect_

import { toArray } from "@effect-ts-app/core/Chunk"

/**
 * @tsplus fluent ets/Chunk toArray
 */
export const ext_toArray = toArray

import { find_ } from "@effect-ts-app/core/Chunk"

/**
 * @tsplus fluent ets/Chunk find
 */
export const ext_find_ = find_

import { find_ } from "@effect-ts-app/core/Chunk"

/**
 * @tsplus fluent ets/Chunk find
 */
export const ext_find_ = find_

declare global {
  interface ArrayOps extends AOps, IterableOps {}
  interface ReadonlyArrayOps extends AOps, IterableOps {
    // undo the global overwrite in ETS
import { mapOriginal_ } from "@effect-ts-app/fluent/_ext/Array"

/**
 * @tsplus fluent ets/Array map
 */
export const ext_mapOriginal_ = mapOriginal_

  interface Set<T> extends SetOps {}
  /**
   * @tsplus type ets/ROSet
   */
  interface ReadonlySet<T> extends ReadonlySetOps {}
  interface SetOps extends SOps, IterableOps {}
  interface ReadonlySetOps extends SOps, IterableOps {}

  // interface Iterable<T> extends IterableOps {}
  // interface IterableIterator<T> extends IterableOps {}
  // interface Generator<T, A, B> extends IterableOps {}
}
