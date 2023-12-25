// tracing: off

import { pipe } from "@effect-app/core/Function"
import type { NonEmptySet } from "@effect-app/core/NonEmptySet"

import * as S from "../custom.js"
import { minSize } from "./length.js"
import { set } from "./set.js"

export function nonEmptySet<To, ConstructorInput, From, Api>(
  self: S.Schema<unknown, To, ConstructorInput, From, Api>,
  ord: Order<To>,
  eq?: Equivalence<To>
) {
  return pipe(set(self, ord, eq), minSize<NonEmptySet<To>>(1), S.withDefaults)
}
