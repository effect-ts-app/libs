import * as Schema from "effect/Schema"
import * as SchemaGetter from "effect/SchemaGetter"
import * as SchemaIssue from "effect/SchemaIssue"

/**
 * Transport native SchemaError identity and its formatted message. The decoded
 * issue is an InvalidValue carrying that message, not the original AST/input.
 */
export const SchemaErrorCodec = Schema
  .Struct({
    _tag: Schema.Literal("SchemaError"),
    message: Schema.String
  })
  .pipe(
    Schema.decodeTo(Schema.declare(Schema.isSchemaError), {
      decode: SchemaGetter.transform(({ message }) =>
        new Schema.SchemaError(new SchemaIssue.InvalidValue({ message }))
      ),
      encode: SchemaGetter.transform((error) => ({ _tag: "SchemaError" as const, message: error.message }))
    })
  )
