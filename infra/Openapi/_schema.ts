import {
  AnyError,
  HasContinuation,
  Schema,
  SchemaAny,
  SchemaContinuationSymbol,
} from "@effect-ts-app/core/ext/Schema"

import type { JSONSchema } from "./atlas-plutus"

export * from "@effect-ts-app/core/ext/Schema"

export class SchemaOpenApi<
    ParserInput,
    ParserError extends AnyError,
    ParsedShape,
    ConstructorInput,
    ConstructorError extends AnyError,
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
  return <
    ParserInput,
    ParserError extends AnyError,
    ConstructorInput,
    ConstructorError extends AnyError,
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
  ParserError extends AnyError,
  ParsedShape,
  ConstructorInput,
  ConstructorError extends AnyError,
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
