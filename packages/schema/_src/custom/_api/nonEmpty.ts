// tracing: off

import { pipe } from "@effect-ts-app/core/Function"
import { NonEmptyBrand } from "@effect-ts-app/core/NonEmptySet"

import * as S from "../_schema/index.js"
import type { DefaultSchema } from "./withDefaults.js"
import { withDefaults } from "./withDefaults.js"

export { NonEmptyBrand } from "@effect-ts-app/core/NonEmptySet"

export const nonEmptyIdentifier = S.makeAnnotation<{ self: S.SchemaAny }>()

export function nonEmpty<
  ParserInput,
  ParsedShape extends { length: number },
  ConstructorInput,
  Encoded,
  Api
>(
  self: S.Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
): DefaultSchema<
  ParserInput,
  ParsedShape & NonEmptyBrand,
  ConstructorInput,
  Encoded,
  Api
> {
  return pipe(
    self,
    S.refine(
      (n): n is ParsedShape & NonEmptyBrand => n.length > 0,
      (n) => S.leafE(S.nonEmptyE(n))
    ),
    withDefaults,
    S.annotate(nonEmptyIdentifier, { self })
  )
}
