import * as OptionModule from "@fp-ts/data/Option"

import * as ChunkModule from "@fp-ts/data/Chunk"
import type { OptionOps } from "./_global.js"

/**
 * @tsplus fp-ts/data/Chunk.Ops
 */
export interface ChunkOps {}
export const Option: OptionOps = {}

// export const Option = OptionModule

export type Option<A> = OptionModule.Option<A>

const cba = OptionModule.fromNullable(1)
cba.map(a => a + 1)

/**
 * @tsplus fp-ts/data/Chunk.Ops
 */
export interface ChunkOps {}
export const Chunk: ChunkOps = {}

// export const Chunk = ChunkModule

export type Chunk<A> = ChunkModule.Chunk<A>

const cba2 = ChunkModule.unsafeFromArray([1])
cba2.map(a => a + 1)

const cba3 = ChunkModule.Chunk.unsafeFromArray([1])
