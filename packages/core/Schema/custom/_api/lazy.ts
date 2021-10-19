import type { Schema } from "../_schema"
import { SchemaLazy } from "../_schema"
import type { DefaultSchema } from "./withDefaults"
import { withDefaults } from "./withDefaults"

export function lazy<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>(
  self: () => Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
): DefaultSchema<ParserInput, ParsedShape, ConstructorInput, Encoded, {}> {
  return withDefaults(new SchemaLazy(self))
}
