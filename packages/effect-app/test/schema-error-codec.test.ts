import * as Option from "effect/Option"
import * as Schema from "effect/Schema"
import * as SchemaIssue from "effect/SchemaIssue"
import { describe, expect, it } from "vitest"
import { SchemaErrorCodec } from "../src/Schema.js"

describe("SchemaErrorCodec", () => {
  it("round-trips a native schema failure through JSON with its message and identity", () => {
    const error = new Schema.SchemaError(
      new SchemaIssue.Pointer(["orders", 0, "quantity"], new SchemaIssue.InvalidType(Schema.Number.ast, "bad"))
    )
    const codec = Schema.fromJsonString(SchemaErrorCodec)
    const encoded = Schema.encodeSync(codec)(error)
    const decoded = Schema.decodeUnknownSync(codec)(encoded)
    expect(Schema.isSchemaError(decoded)).toBe(true)
    expect(decoded).toBeInstanceOf(Schema.SchemaError)
    expect(decoded.message).toBe(error.message)
    expect(decoded.toString()).toBe(error.toString())
    expect(JSON.parse(encoded)).toEqual({ _tag: "SchemaError", message: error.message })
  })

  it("rejects malformed wire errors and does not accept another error type", () => {
    expect(Option.isNone(Schema.decodeUnknownOption(SchemaErrorCodec)({ _tag: "SchemaError" }))).toBe(true)
    expect(Option.isNone(Schema.decodeUnknownOption(SchemaErrorCodec)({ _tag: "OtherError", message: "bad" }))).toBe(
      true
    )
    expect(() => Schema.encodeUnknownSync(SchemaErrorCodec)(new Error("bad"))).toThrow()
  })
})
