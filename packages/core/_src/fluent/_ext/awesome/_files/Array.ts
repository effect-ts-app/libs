/* eslint-disable @typescript-eslint/no-unused-vars */

// ets_tracing: off
import { map_ as NEMap_ } from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import {
  append_,
  collect_,
  concat_,
  filter_,
  find_,
  findFirstMap_,
  flatten,
  head,
  last,
  map_,
  mapEffect_,
  mapSync_,
  mapWithIndex_,
  tail,
} from "@effect-ts-app/core/Array"
import { sort_, sortBy_, uniq_ } from "@effect-ts-app/core/fluent/_ext/Array"
import { mapEither_, mapMaybe_ } from "@effect-ts-app/core/fluent/fluent/Array"

/**
 * @tsplus fluent ets/Array mapRA
 */
export const ext_map_ = map_

/**
 * @tsplus fluent ets/NonEmptyArray mapRA
 */
export const ext_map_NA_ = NEMap_

/**
 * @tsplus fluent ets/Array mapWithIndex
 */
export const ext_mapWithIndex_ = mapWithIndex_

// /**
//  * @tsplus fluent ets/Array concatRA
//  */
// export const ext_concat_ = concat_

/**
 * @tsplus fluent ets/Array concatRA
 */
export const ext_concat_ = concat_

// /**
//  * @tsplus fluent ets/Array sortWith
//  */
// export const ext_sort_ = sort_

/**
 * @tsplus fluent ets/Array sortWith
 */
export const ext_sort_ = sort_

/**
 * @tsplus fluent ets/Array sortBy
 */
export const ext_sortBy_ = sortBy_

// /**
//  * @tsplus fluent ets/Array append
//  */
// export const ext_append_ = append_

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
 * @tsplus fluent ets/Array mapMaybe
 */
export const ext_mapMaybe_ = mapMaybe_

// /**
//  * @tsplus fluent ets/Array mapM
//  */
// export const ext_mapEffect_ = mapEffect_

// /**
//  * @tsplus fluent ets/Array mapM
//  */
// export const ext_mapEffect_ = mapEffect_

// /**
//  * @tsplus fluent ets/mapM mapM
//  */
// export const ext_mapM_ = mapM_

// /**
//  * @tsplus fluent ets/mapM mapM
//  */
// export const ext_mapM_ = mapM_

// /**
//  * @tsplus fluent ets/Array mapM
//  */
// export const ext_mapEffect_ = mapEffect_

// /**
//  * @tsplus fluent ets/Array mapM
//  */
// export const ext_mapEffect_ = mapEffect_

// /**
//  * @tsplus fluent ets/mapM mapM
//  */
// export const ext_mapM_ = mapM_

// /**
//  * @tsplus fluent ets/mapM mapM
//  */
// export const ext_mapM_ = mapM_

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

// /**
//  * @tsplus fluent ets/Array filterRA
//  */
// export const ext_filter_ = filter_

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
