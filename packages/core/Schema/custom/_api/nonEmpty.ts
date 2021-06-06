// tracing: off

import { pipe } from "@effect-ts/core/Function"

import * as S from "../_schema"
import type { DefaultSchema } from "./withDefaults"
import { withDefaults } from "./withDefaults"

export interface NonEmptyBrand {
  readonly NonEmpty: unique symbol
}

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
