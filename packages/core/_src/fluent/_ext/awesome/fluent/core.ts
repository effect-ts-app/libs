// ets_tracing: off

import {
  fromMutable,
  getEqual,
  map_,
  toMutable,
} from "@effect-ts/core/Collections/Immutable/Array"
import { from } from "@effect-ts/core/Collections/Immutable/Chunk"

/**
 * @tsplus static ets/Array.Ops getEqual
 */
export const ext_getEqual = getEqual

/**
 * @tsplus fluent ets/Array immutable
 */
export const ext_fromMutable = fromMutable

// /**
//  * @tsplus fluent ets/Array mapM
//  */
// export const ext_mapSync_ = mapSync_

// /**
//  * @tsplus fluent ets/Array mapM
//  */
// export const ext_mapEither_ = mapEither_

// /**
//  * @tsplus fluent ets/Array mapM
//  */
// export const ext_mapMaybe_ = mapMaybe_

// /**
//  * @tsplus fluent ets/Array mapM
//  */
// export const ext_mapEffect_ = mapEffect_

/**
 * @tsplus getter ets/Array toChunk
 */
export const ext_from = from

/**
 * @tsplus getter ets/Array mutable
 */
export const ext_toMutable = toMutable

/**
 * @tsplus fluent ets/Array map
 */
export const ext_map_ = map_

// /**
//  * @tsplus fluent ets/Array mapM
//  */
// export const ext_mapSync_ = mapSync_

// /**
//  * @tsplus fluent ets/Array mapM
//  */
// export const ext_mapEither_ = mapEither_

// /**
//  * @tsplus fluent ets/Array mapM
//  */
// export const ext_mapMaybe_ = mapMaybe_

// /**
//  * @tsplus fluent ets/Array mapM
//  */
// export const ext_mapEffect_ = mapEffect_
