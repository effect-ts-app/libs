// tracing: off

import { pipe } from "@effect-ts/core/Function"

import * as S from "../_schema/index.js"
import type { DefaultSchema } from "./withDefaults.js"
import { withDefaults } from "./withDefaults.js"

export interface PositiveBrand {
  readonly Positive: unique symbol
}

export type Positive = number & PositiveBrand

export const positiveIdentifier = S.makeAnnotation<{ self: S.SchemaAny }>()

export function positive<
  ParserInput,
  ParsedShape extends number,
  ConstructorInput,
  Encoded,
  Api
>(
  self: S.Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
): DefaultSchema<
  ParserInput,
  ParsedShape & PositiveBrand,
  ConstructorInput,
  Encoded,
  Api
> {
  return pipe(
    self,
    S.refine(
      (n): n is ParsedShape & Positive => n >= 0,
      (n) => S.leafE(S.positiveE(n))
    ),
    withDefaults,
    S.annotate(positiveIdentifier, { self })
  )
}
