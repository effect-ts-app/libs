// Temporary workaround for missing .Aspects variations in current fp-ts and effect

import * as Array$_ from "./Array.js"
import * as Chunk$_ from "./Chunk.js"
import * as Effect$_ from "./Effect.js"
import * as Either$_ from "./Either.js"
import * as Option$_ from "./Option.js"

/**
 * @tsplus static effect/io/Effect.Ops $
 */
export const Effect$ = Effect$_

/**
 * @tsplus static fp-ts/data/Option.Ops $
 */
export const Option$ = Option$_

/**
 * @tsplus static fp-ts/data/Either.Ops $
 */
export const Either$ = Either$_

/**
 * @tsplus static fp-ts/data/Chunk.Ops $
 */
export const Chunk$ = Chunk$_

/**
 * @tsplus static ReadonlyArray.Ops $
 */
export const Array$ = Array$_
