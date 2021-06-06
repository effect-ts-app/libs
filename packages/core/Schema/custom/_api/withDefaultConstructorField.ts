import type { Lazy } from "@effect-ts/core/Function"
import { pipe } from "@effect-ts/system/Function"

import * as S from "../_schema"
import * as Constructor from "../Constructor"
import type { DefaultSchema } from "./withDefaults"
import { withDefaults } from "./withDefaults"

export type OptionalKey<ConstructorInput, Key extends keyof ConstructorInput> = Omit<
  ConstructorInput,
  Key
> &
  Partial<Pick<ConstructorInput, Key>>

export const withDefaultConstructorFieldIdentifier =
  S.makeAnnotation<{
    key: PropertyKey
    value: Lazy<unknown>
    self: S.SchemaAny
  }>()

export function withDefaultConstructorField<
  ConstructorInput,
  Key extends keyof ConstructorInput
>(
  key: Key,
  value: Lazy<ConstructorInput[Key]>
): <ParserInput, ParserError, ParsedShape, ConstructorError, Encoded, Api>(
  self: S.Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >
) => DefaultSchema<
  ParserInput,
  ParserError,
  ParsedShape,
  OptionalKey<ConstructorInput, Key>,
  ConstructorError,
  Encoded,
  Api
> {
  return (self) => {
    const constructSelf = Constructor.for(self)
    return pipe(
      self,
      S.constructor((u: any) =>
        constructSelf(typeof u[key] !== "undefined" ? u : { ...u, [key]: value() })
      ),
      withDefaults,
      S.annotate(withDefaultConstructorFieldIdentifier, { self, key, value })
    )
  }
}
