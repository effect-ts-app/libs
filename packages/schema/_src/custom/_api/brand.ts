// tracing: off
import type { ApiSelfType, Schema } from "../_schema/schema.js"
import type { DefaultSchema } from "./withDefaults.js"
import { withDefaults } from "./withDefaults.js"

export function brand<B>() {
  return <ParserInput, ParsedShape, ConstructorInput, Encoded, Api>(
    self: Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
  ): DefaultSchema<ParserInput, B, ConstructorInput, Encoded, Api & ApiSelfType<B>> => {
    // @ts-expect-error
    return withDefaults(self)
  }
}
