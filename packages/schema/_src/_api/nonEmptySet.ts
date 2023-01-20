// tracing: off

import { pipe } from "@effect-app/core/Function"
import type { NonEmptySet } from "@effect-app/core/NonEmptySet"

import * as MO from "../custom.js"
import { minSize } from "./length.js"
import { set } from "./set.js"

export function nonEmptySet<ParsedShape, ConstructorInput, Encoded, Api>(
  self: MO.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>,
  ord: Order<ParsedShape>,
  eq?: Equivalence<ParsedShape>
) {
  return pipe(set(self, ord, eq), minSize<NonEmptySet<ParsedShape>>(1), MO.withDefaults)
}
