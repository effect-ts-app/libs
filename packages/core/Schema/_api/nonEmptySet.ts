// tracing: off

import type { Set } from "@effect-ts/core/Collections/Immutable/Set"
import type * as Eq from "@effect-ts/core/Equal"
import { pipe } from "@effect-ts/core/Function"
import * as Option from "@effect-ts/core/Option"
import * as Ord from "@effect-ts/core/Ord"

import * as MO from "../custom/index.js"
import { NonEmptyBrand } from "../custom/index.js"
import { minSize } from "./length.js"
import { set } from "./set.js"

export function nonEmptySet<ParsedShape, ConstructorInput, Encoded, Api>(
  self: MO.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>,
  ord: Ord.Ord<ParsedShape>,
  eq?: Eq.Equal<ParsedShape>
) {
  return pipe(set(self, ord, eq), minSize<NonEmptySet<ParsedShape>>(1), MO.withDefaults)
}

export const NonEmptySet = {
  from: <A>(set: Set<A>) => {
    if (set.size > 0) {
      return Option.some(set as NonEmptySet<A>)
    } else {
      return Option.none
    }
  },
}

export type NonEmptySet<A> = Set<A> & NonEmptyBrand
