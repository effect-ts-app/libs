import type { StringConstructorSchema } from "@effect-ts-app/schema2"
import { Annotations, Arbitrary, Hook, makeConstructorFromSchema, Schema } from "@effect-ts-app/schema2"
import { customRandom, nanoid, urlAlphabet } from "nanoid"
import type * as SchemaLegacy from "../schema.js"

const size = 21
const length = 10 * size

export type StringId = SchemaLegacy.StringId

export interface Make<A> {
  make: () => A
}

const stringId: StringConstructorSchema<StringId> = makeConstructorFromSchema(
  Schema.string,
  s =>
    s.minLength(6)
      .maxLength(50)
      .title("StringId")
      .annotations({
        [Annotations.CustomId]: { type: "StringId" },
        [Annotations.ArbitraryHookId]: Hook.hook(() =>
          Arbitrary.make(
            stringId,
            fc =>
              fc.uint8Array({ minLength: length, maxLength: length })
                .map(_ => customRandom(urlAlphabet, size, size => _.subarray(0, size))() as StringId)
          )
        )
      })
      .branded<StringId>()
)

/**
 * An identifier that is at least 6 characters long and a maximum of 50.
 */
export const StringId: StringConstructorSchema<StringId> & Make<StringId> = Object.assign(
  stringId,
  {
    make: () => stringId(nanoid())
  }
)
