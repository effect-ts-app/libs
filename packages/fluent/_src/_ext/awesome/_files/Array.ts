/* eslint-disable @typescript-eslint/no-unused-vars */
// ets_tracing: off
import type { NonEmptyArray } from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import { map_ } from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import type { Either } from "@effect-ts/core/Either"
import type { Equal } from "@effect-ts/core/Equal"
import type { Predicate, Refinement } from "@effect-ts/core/Function"
import type { Option } from "@effect-ts/core/Option"
import type { Ord } from "@effect-ts/core/Ord"
import type * as ARR from "@effect-ts-app/core/Array"
import {
  append_,
  append_,
  collect_,
  concat_,
  concat_,
  filter_,
  filter_,
  find_,
  findFirstMap_,
  flatten,
  head,
  last,
  mapEffect_,
  mapEffect_,
  mapEffect_,
  mapEffect_,
  mapSync_,
  mapWithIndex_,
  tail,
} from "@effect-ts-app/core/Array"
import type { Chunk } from "@effect-ts-app/core/Chunk"
import type { Effect } from "@effect-ts-app/core/Effect"
import type * as SET from "@effect-ts-app/core/Set"
import type { Sync } from "@effect-ts-app/core/Sync"
import { sort_, sort_, sortBy_, uniq_ } from "@effect-ts-app/fluent/_ext/Array"
import { mapM_, mapM_, mapM_, mapM_ } from "@effect-ts-app/fluent/_ext/mapM"
import {
  mapEither_,
  mapEither_,
  mapOption_,
  mapOption_,
} from "@effect-ts-app/fluent/fluent/Array"

/**
 * @tsplus fluent ets/NonEmptyArray mapRA
 */
export const ext_map_ = map_

/**
 * @tsplus fluent ets/Array mapWithIndex
 */
export const ext_mapWithIndex_ = mapWithIndex_

/**
 * @tsplus fluent ets/Array concatRA
 */
export const ext_concat_ = concat_

/**
 * @tsplus fluent ets/Array concatRA
 */
export const ext_concat_ = concat_

/**
 * @tsplus fluent ets/Array sortWith
 */
export const ext_sort_ = sort_

/**
 * @tsplus fluent ets/Array sortWith
 */
export const ext_sort_ = sort_

/**
 * @tsplus fluent ets/Array sortBy
 */
export const ext_sortBy_ = sortBy_

/**
 * @tsplus fluent ets/Array append
 */
export const ext_append_ = append_

/**
 * @tsplus fluent ets/Array append
 */
export const ext_append_ = append_

/**
 * @tsplus fluent ets/Array mapEffect
 */
export const ext_mapEffect_ = mapEffect_

/**
 * @tsplus fluent ets/Array mapSync
 */
export const ext_mapSync_ = mapSync_

/**
 * @tsplus fluent ets/Array mapEither
 */
export const ext_mapEither_ = mapEither_

/**
 * @tsplus fluent ets/Array mapEither
 */
export const ext_mapEither_ = mapEither_

/**
 * @tsplus fluent ets/Array mapOption
 */
export const ext_mapOption_ = mapOption_

/**
 * @tsplus fluent ets/Array mapOption
 */
export const ext_mapOption_ = mapOption_

/**
 * @tsplus fluent ets/Array mapM
 */
export const ext_mapEffect_ = mapEffect_

/**
 * @tsplus fluent ets/Array mapM
 */
export const ext_mapEffect_ = mapEffect_

/**
 * @tsplus fluent ets/mapM mapM
 */
export const ext_mapM_ = mapM_

/**
 * @tsplus fluent ets/mapM mapM
 */
export const ext_mapM_ = mapM_

/**
 * @tsplus fluent ets/Array mapM
 */
export const ext_mapEffect_ = mapEffect_

/**
 * @tsplus fluent ets/Array mapM
 */
export const ext_mapEffect_ = mapEffect_

/**
 * @tsplus fluent ets/mapM mapM
 */
export const ext_mapM_ = mapM_

/**
 * @tsplus fluent ets/mapM mapM
 */
export const ext_mapM_ = mapM_

/**
 * @tsplus fluent ets/Array flatten
 */
export const ext_flatten = flatten

/**
 * @tsplus fluent ets/Array collect
 */
export const ext_collect_ = collect_

/**
 * @tsplus fluent ets/Array findFirst
 */
export const ext_find_ = find_

/**
 * @tsplus fluent ets/Array findFirstMap
 */
export const ext_findFirstMap_ = findFirstMap_

/**
 * @tsplus fluent ets/Array filterRA
 */
export const ext_filter_ = filter_

/**
 * @tsplus fluent ets/Array filterRA
 */
export const ext_filter_ = filter_

/**
 * @tsplus fluent ets/Array uniq
 */
export const ext_uniq_ = uniq_

/**
 * @tsplus fluent ets/Array head
 */
export const ext_head = head

/**
 * @tsplus fluent ets/Array last
 */
export const ext_last = last

/**
 * @tsplus fluent ets/Array tail
 */
export const ext_tail = tail
