// tracing: off
import type { ApiSelfType, Schema } from "../_schema/schema"
import type { DefaultSchema } from "./withDefaults"
import { withDefaults } from "./withDefaults"

export function brand<B>() {
  return <
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
    >
  ): DefaultSchema<
    ParserInput,
    ParserError,
    B,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api & ApiSelfType<B>
  > => {
    // @ts-expect-error
    return withDefaults(self)
  }
}
