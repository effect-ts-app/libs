// tracing: off
import type { ApiSelfType, Schema } from "../_schema/schema.js"
import type { DefaultSchema } from "./withDefaults.js"
import { withDefaults } from "./withDefaults.js"

export function brand<B>() {
  return <ParserInput, To, ConstructorInput, From, Api>(
    self: Schema<ParserInput, To, ConstructorInput, From, Api>
  ): DefaultSchema<ParserInput, B, ConstructorInput, From, Api & ApiSelfType<B>> => {
    // @ts-expect-error
    return withDefaults(self)
  }
}
