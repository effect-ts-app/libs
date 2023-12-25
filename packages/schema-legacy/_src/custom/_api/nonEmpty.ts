// tracing: off

import { pipe } from "@effect-app/core/Function"
import type { NonEmptyBrand } from "@effect-app/core/NonEmptySet"

import * as S from "../_schema.js"
import type { DefaultSchema } from "./withDefaults.js"
import { withDefaults } from "./withDefaults.js"

export { NonEmptyBrand } from "@effect-app/core/NonEmptySet"

export const nonEmptyIdentifier = S.makeAnnotation<{ self: S.SchemaAny }>()

export function nonEmpty<
  ParserInput,
  To extends { length: number },
  ConstructorInput,
  From,
  Api
>(
  self: S.Schema<ParserInput, To, ConstructorInput, From, Api>
): DefaultSchema<
  ParserInput,
  To & NonEmptyBrand,
  ConstructorInput,
  From,
  Api
> {
  return pipe(
    self,
    S.refine(
      (n): n is To & NonEmptyBrand => n.length > 0,
      (n) => S.leafE(S.nonEmptyE(n))
    ),
    withDefaults,
    S.annotate(nonEmptyIdentifier, { self })
  )
}
