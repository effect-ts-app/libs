import { chain_, Chunk } from "@effect-ts/core/Collections/Immutable/Chunk"

import { identity } from "./Function"

export function flatten<A>(mma: Chunk<Chunk<A>>): Chunk<A> {
  return chain_(mma, identity)
}

export * from "@effect-ts/core/Collections/Immutable/Chunk"
