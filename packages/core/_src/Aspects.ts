// Temporary workaround for missing .Aspects variations in current fp-ts and effect

import * as Array$_ from "./Array.js"

/**
 * @tsplus type fp-ts/data/Chunk.Aspects
 */
export interface ChunkAspects {}

/**
 * @tsplus static fp-ts/data/Chunk.Ops $
 */
export const Chunk: ChunkAspects = {}

/**
 * @tsplus type fp-ts/data/Either.Aspects
 */
export interface EitherAspects {}

/**
 * @tsplus static fp-ts/data/Either.Ops $
 */
export const Either: EitherAspects = {}

/**
 * @tsplus type fp-ts/data/Option.Aspects
 */
export interface OptionAspects {}

/**
 * @tsplus static fp-ts/data/Option.Ops $
 */
export const Option: OptionAspects = {}

/**
 * @tsplus type effect/io/Config.Aspects
 */
export interface ConfigAspects {}

/**
 * @tsplus static effect/io/Config.Ops $
 */
export const Config: ConfigAspects = {}

/**
 * @tsplus type effect/io/Effect.Aspects
 */
export interface EffectAspects {}

/**
 * @tsplus static effect/io/Effect.Ops $
 */
export const Effect: EffectAspects = {}

/**
 * @tsplus type effect/io/Layer.Aspects
 */
export interface LayerAspects {}

/**
 * @tsplus static effect/io/Layer.Ops $
 */
export const Layer: LayerAspects = {}

/**
 * @tsplus type effect/io/Exit.Aspects
 */
export interface ExitAspects {}

/**
 * @tsplus static effect/io/Exit.Ops $
 */
export const Exit: ExitAspects = {}

/**
 * @tsplus type effect/io/Cause.Aspects
 */
export interface CauseAspects {}

/**
 * @tsplus static effect/io/Cause.Ops $
 */
export const Cause: CauseAspects = {}

// TODO

/**
 * @tsplus static ReadonlyArray.Ops $
 */
export const Array$ = Array$_

// /**
//  * @tsplus type fp-ts/data/ReadonlyArray.Aspects
//  */
// export interface ReadonlyArrayAspects {}

// /**
//  * @tsplus static fp-ts/data/ReadonlyArray.Ops $
//  */
// export const ReadonlyArray: ReadonlyArrayAspects = {}
