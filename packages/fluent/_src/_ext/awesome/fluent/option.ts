// ets_tracing: off

/* eslint-disable @typescript-eslint/no-namespace */
import type { Tuple } from "@effect-ts/core/Collections/Immutable/Tuple"
import type * as E from "@effect-ts/core/Either"
import type { Predicate, Refinement } from "@effect-ts/core/Function"
import type * as O from "@effect-ts/core/Option"
import type { Separated } from "@effect-ts/core/Utils"

declare module "@effect-ts/system/Option/core" {
  export interface OptionOps<A> {
    /**
     * @ets_rewrite_method pipe from "smart:pipe"
     */
    pipe<Self, Ret>(this: Self, f: (self: Self) => Ret): Ret
import { ap_ } from "@effect-ts/core/Option"

/**
 * @tsplus fluent ets/Option ap
 */
export const ext_ap_ = ap_

import { chain_ } from "@effect-ts/core/Option"

/**
 * @tsplus fluent ets/Option chain
 */
export const ext_chain_ = chain_

import { duplicate } from "@effect-ts/core/Option"

/**
 * @tsplus fluent ets/Option duplicate
 */
export const ext_duplicate = duplicate

import { exists_ } from "@effect-ts/core/Option"

/**
 * @tsplus fluent ets/Option exists
 */
export const ext_exists_ = exists_

import { extend_ } from "@effect-ts/core/Option"

/**
 * @tsplus fluent ets/Option extend
 */
export const ext_extend_ = extend_

import { flatten } from "@effect-ts/core/Option"

/**
 * @tsplus fluent ets/Option flatten
 */
export const ext_flatten = flatten

import { filter_ } from "@effect-ts/core/Option"

/**
 * @tsplus fluent ets/Option filter
 */
export const ext_filter_ = filter_

import { filter_ } from "@effect-ts/core/Option"

/**
 * @tsplus fluent ets/Option filter
 */
export const ext_filter_ = filter_

import { filterMap_ } from "@effect-ts/core/Option"

/**
 * @tsplus fluent ets/Option filter
 */
export const ext_filterMap_ = filterMap_

import { fold_ } from "@effect-ts/core/Option"

/**
 * @tsplus fluent ets/Option fold
 */
export const ext_fold_ = fold_

import { getOrElse_ } from "@effect-ts/core/Option"

/**
 * @tsplus fluent ets/Option getOrElse
 */
export const ext_getOrElse_ = getOrElse_

import { isSome } from "@effect-ts/core/Option"

/**
 * @tsplus fluent ets/Option isSome
 */
export const ext_isSome = isSome

import { isNone } from "@effect-ts/core/Option"

/**
 * @tsplus fluent ets/Option isNone
 */
export const ext_isNone = isNone

import { map_ } from "@effect-ts/core/Option"

/**
 * @tsplus fluent ets/Option map
 */
export const ext_map_ = map_

import { partitionMap_ } from "@effect-ts/core/Option"

/**
 * @tsplus fluent ets/Option partition
 */
export const ext_partitionMap_ = partitionMap_

import { partition_ } from "@effect-ts/core/Option"

/**
 * @tsplus fluent ets/Option partition
 */
export const ext_partition_ = partition_

import { partition_ } from "@effect-ts/core/Option"

/**
 * @tsplus fluent ets/Option partition
 */
export const ext_partition_ = partition_

import { separate } from "@effect-ts/core/Option"

/**
 * @tsplus fluent ets/Option separate
 */
export const ext_separate = separate

import { tap_ } from "@effect-ts/core/Option"

/**
 * @tsplus fluent ets/Option tap
 */
export const ext_tap_ = tap_

import { toUndefined } from "@effect-ts/core/Option"

/**
 * @tsplus fluent ets/Option toUndefined
 */
export const ext_toUndefined = toUndefined

import { zip_ } from "@effect-ts/core/Option"

/**
 * @tsplus fluent ets/Option zip
 */
export const ext_zip_ = zip_

import { zipFirst_ } from "@effect-ts/core/Option"

/**
 * @tsplus fluent ets/Option zipLeft
 */
export const ext_zipFirst_ = zipFirst_

import { zipSecond_ } from "@effect-ts/core/Option"

/**
 * @tsplus fluent ets/Option zipRight
 */
export const ext_zipSecond_ = zipSecond_

    /**
     * @ets_rewrite_getter toUndefined from "@effect-ts/core/Option"
     */
    get value(): A | undefined
  }

  export interface Some<A> extends OptionOps<A> {}
  export interface None extends OptionOps<never> {}

  export interface OptionStaticOps {
import { some } from "@effect-ts/core/Option"

/**
 * @tsplus static ets/Option.Ops some
 */
export const ext_some = some

import { none } from "@effect-ts/core/Option"

/**
 * @tsplus static ets/Option.Ops none
 */
export const ext_none = none

import { Applicative } from "@effect-ts/core/Option"

/**
 * @tsplus static ets/Option.Ops Applicative
 */
export const ext_Applicative = Applicative

  export const Option: OptionStaticOps
}
