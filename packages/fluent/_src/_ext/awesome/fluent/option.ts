// ets_tracing: off

/* eslint-disable @typescript-eslint/no-namespace */
import {
  ap_,
  Applicative,
  chain_,
  duplicate,
  exists_,
  extend_,
  filter_,
  filter_,
  filterMap_,
  flatten,
  fold_,
  getOrElse_,
  isNone,
  isSome,
  map_,
  none,
  partition_,
  partition_,
  partitionMap_,
  separate,
  some,
  tap_,
  toUndefined,
  zip_,
  zipFirst_,
  zipSecond_,
} from "@effect-ts/core/Option"

/**
 * @tsplus fluent ets/Option ap
 */
export const ext_ap_ = ap_

/**
 * @tsplus fluent ets/Option chain
 */
export const ext_chain_ = chain_

/**
 * @tsplus fluent ets/Option duplicate
 */
export const ext_duplicate = duplicate

/**
 * @tsplus fluent ets/Option exists
 */
export const ext_exists_ = exists_

/**
 * @tsplus fluent ets/Option extend
 */
export const ext_extend_ = extend_

/**
 * @tsplus fluent ets/Option flatten
 */
export const ext_flatten = flatten

/**
 * @tsplus fluent ets/Option filter
 */
export const ext_filter_ = filter_

/**
 * @tsplus fluent ets/Option filter
 */
export const ext_filter_ = filter_

/**
 * @tsplus fluent ets/Option filter
 */
export const ext_filterMap_ = filterMap_

/**
 * @tsplus fluent ets/Option fold
 */
export const ext_fold_ = fold_

/**
 * @tsplus fluent ets/Option getOrElse
 */
export const ext_getOrElse_ = getOrElse_

/**
 * @tsplus fluent ets/Option isSome
 */
export const ext_isSome = isSome

/**
 * @tsplus fluent ets/Option isNone
 */
export const ext_isNone = isNone

/**
 * @tsplus fluent ets/Option map
 */
export const ext_map_ = map_

/**
 * @tsplus fluent ets/Option partition
 */
export const ext_partitionMap_ = partitionMap_

/**
 * @tsplus fluent ets/Option partition
 */
export const ext_partition_ = partition_

/**
 * @tsplus fluent ets/Option partition
 */
export const ext_partition_ = partition_

/**
 * @tsplus fluent ets/Option separate
 */
export const ext_separate = separate

/**
 * @tsplus fluent ets/Option tap
 */
export const ext_tap_ = tap_

/**
 * @tsplus fluent ets/Option toUndefined
 */
export const ext_toUndefined = toUndefined

/**
 * @tsplus fluent ets/Option zip
 */
export const ext_zip_ = zip_

/**
 * @tsplus fluent ets/Option zipLeft
 */
export const ext_zipFirst_ = zipFirst_

/**
 * @tsplus fluent ets/Option zipRight
 */
export const ext_zipSecond_ = zipSecond_

/**
 * @tsplus static ets/Option.Ops some
 */
export const ext_some = some

/**
 * @tsplus static ets/Option.Ops none
 */
export const ext_none = none

/**
 * @tsplus static ets/Option.Ops Applicative
 */
export const ext_Applicative = Applicative

export const Option: OptionStaticOps
