import type { Schema } from "../_schema.js"
import { SchemaLazy } from "../_schema.js"
import type { DefaultSchema } from "./withDefaults.js"
import { withDefaults } from "./withDefaults.js"

export function lazy<ParserInput, To, ConstructorInput, From, Api>(
  self: () => Schema<ParserInput, To, ConstructorInput, From, Api>
): DefaultSchema<ParserInput, To, ConstructorInput, From, {}> {
  return withDefaults(new SchemaLazy(self))
}
