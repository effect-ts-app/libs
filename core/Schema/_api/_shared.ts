import * as CNK from "@effect-ts/core/Collections/Immutable/Chunk"

import * as MO from "../_schema"

export const empty = CNK.empty<never>()
export function tree<A>(value: A, forest: MO.Forest<A> = empty): MO.Tree<A> {
  return {
    value,
    forest,
  }
}
