import {
  HasContinuation,
  Schema,
  SchemaAny,
  SchemaContinuationSymbol,
} from "@effect-ts-app/schema"

import type { JSONSchema } from "./atlas-plutus/index.js"

export class SchemaOpenApi<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
  extends Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
  implements HasContinuation
{
  readonly Api = this.self.Api;
  readonly [SchemaContinuationSymbol]: SchemaAny
  constructor(
    readonly self: Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>,
    readonly jsonSchema: () => JSONSchema
  ) {
    super()
    this[SchemaContinuationSymbol] = self
  }
}

export function openapi<ParsedShape>(f: () => JSONSchema) {
  return <ParserInput, ConstructorInput, Encoded, Api>(
    self: Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
  ): Schema<
    ParserInput,
    ParsedShape,
    ConstructorInput,
    Encoded,
    Api
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  > => new SchemaOpenApi(self, f) as any
}

export function openapi_<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>(
  self: Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>,
  f: () => JSONSchema
): Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api> {
  return new SchemaOpenApi(self, f)
}
