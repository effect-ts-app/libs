// ets_tracing: off

import {
  fromMutable,
  getEqual,
  map_,
  mapEffect_,
  mapEffect_,
  mapSync_,
  mapSync_,
  toMutable,
} from "@effect-ts/core/Collections/Immutable/Array"
import { from } from "@effect-ts/core/Collections/Immutable/Chunk"
import {
  mapEither_,
  mapEither_,
  mapOption_,
  mapOption_,
} from "@effect-ts-app/fluent/fluent/Array"

/**
 * @tsplus static ets/Array.Ops getEqual
 */
export const ext_getEqual = getEqual

/**
 * @tsplus fluent ets/Array immutable
 */
export const ext_fromMutable = fromMutable

/**
 * @tsplus fluent ets/Array mapM
 */
export const ext_mapSync_ = mapSync_

/**
 * @tsplus fluent ets/Array mapM
 */
export const ext_mapEither_ = mapEither_

/**
 * @tsplus fluent ets/Array mapM
 */
export const ext_mapOption_ = mapOption_

/**
 * @tsplus fluent ets/Array mapM
 */
export const ext_mapEffect_ = mapEffect_

/**
 * @tsplus fluent ets/Array toChunk
 */
export const ext_from = from

/**
 * @tsplus fluent ets/Array mutable
 */
export const ext_toMutable = toMutable

/**
 * @tsplus fluent ets/Array map
 */
export const ext_map_ = map_

/**
 * @tsplus fluent ets/Array mapM
 */
export const ext_mapSync_ = mapSync_

/**
 * @tsplus fluent ets/Array mapM
 */
export const ext_mapEither_ = mapEither_

/**
 * @tsplus fluent ets/Array mapM
 */
export const ext_mapOption_ = mapOption_

/**
 * @tsplus fluent ets/Array mapM
 */
export const ext_mapEffect_ = mapEffect_
