import {
  HasContinuation,
  Schema,
  SchemaAny,
  SchemaContinuationSymbol,
} from "@effect-ts-app/core/Schema"

import type { JSONSchema } from "./atlas-plutus"

export * from "@effect-ts-app/core/Schema"

export class SchemaOpenApi<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >
  extends Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >
  implements HasContinuation
{
  readonly Api = this.self.Api;
  readonly [SchemaContinuationSymbol]: SchemaAny
  constructor(
    readonly self: Schema<
      ParserInput,
      ParserError,
      ParsedShape,
      ConstructorInput,
      ConstructorError,
      Encoded,
      Api
    >,
    readonly jsonSchema: () => JSONSchema
  ) {
    super()
    this[SchemaContinuationSymbol] = self
  }
}

export function openapi<ParsedShape>(f: () => JSONSchema) {
  return <ParserInput, ParserError, ConstructorInput, ConstructorError, Encoded, Api>(
    self: Schema<
      ParserInput,
      ParserError,
      ParsedShape,
      ConstructorInput,
      ConstructorError,
      Encoded,
      Api
    >
  ): Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  > => new SchemaOpenApi(self, f) as any
}

export function openapi_<
  ParserInput,
  ParserError,
  ParsedShape,
  ConstructorInput,
  ConstructorError,
  Encoded,
  Api
>(
  self: Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >,
  f: () => JSONSchema
): Schema<
  ParserInput,
  ParserError,
  ParsedShape,
  ConstructorInput,
  ConstructorError,
  Encoded,
  Api
> {
  return new SchemaOpenApi(self, f)
}
