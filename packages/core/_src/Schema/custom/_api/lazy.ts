import type { Schema } from "../_schema/index.js"
import { SchemaLazy } from "../_schema/index.js"
import type { DefaultSchema } from "./withDefaults.js"
import { withDefaults } from "./withDefaults.js"

export function lazy<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>(
  self: () => Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
): DefaultSchema<ParserInput, ParsedShape, ConstructorInput, Encoded, {}> {
  return withDefaults(new SchemaLazy(self))
}
