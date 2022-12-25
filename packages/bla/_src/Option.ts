import { Chunk, unsafeFromArray } from "@fp-ts/data/Chunk"
import { Option } from "@fp-ts/data/Option"
import { NonEmptyReadonlyArray } from "@fp-ts/data/ReadonlyArray"
import { ReadonlyArray } from "./test.js"

export const cnk2 = unsafeFromArray([1])
export const cnk2b = cnk2.drop(5)

export type cnkkk = Chunk<number>
export const cnk = Chunk.unsafeFromArray([1])

export type abc = ReadonlyArray<number>

declare const abc: abc
abc.matchRight(() => "abc", () => "cba")

export type neaa = NonEmptyReadonlyArray<number>
declare const neaa: neaa
neaa.matchRight(() => "abc", () => "cba")
export const nea = NonEmptyReadonlyArray.make(1)
export const nea2 = nea.map(a => a + 1)

export const nea3 = ReadonlyArray.make(1)
export const nea4 = nea3.map(a => a + 1)

export const opt = Option.some(1)
export const opt2 = opt.map(a => a + 1)

// import * as OptionModule from "@fp-ts/data/Option"

// import * as ChunkModule from "@fp-ts/data/Chunk"

// /**
//  * @tsplus fp-ts/data/Chunk.Ops
//  */
// export interface ChunkOps {}
// export const Option: OptionOps = {}

// // export const Option = OptionModule

// export type Option<A> = OptionModule.Option<A>

// const cba = OptionModule.fromNullable(1)
// cba.map(a => a + 1)

// /**
//  * @tsplus fp-ts/data/Chunk.Ops
//  */
// export interface ChunkOps {}
// export const Chunk: ChunkOps = {}

// // export const Chunk = ChunkModule

// export type Chunk<A> = ChunkModule.Chunk<A>

// const cba2 = ChunkModule.unsafeFromArray([1])
// cba2.map(a => a + 1)

// const cba3 = ChunkModule.Chunk.unsafeFromArray([1])
