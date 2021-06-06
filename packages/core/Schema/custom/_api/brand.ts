// tracing: off
import type { ApiSelfType, Schema } from "../_schema/schema"
import type { DefaultSchema } from "./withDefaults"
import { withDefaults } from "./withDefaults"

export function brand<B>() {
  return <ParserInput, ParsedShape, ConstructorInput, Encoded, Api>(
    self: Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
  ): DefaultSchema<ParserInput, B, ConstructorInput, Encoded, Api & ApiSelfType<B>> => {
    // @ts-expect-error
    return withDefaults(self)
  }
}
