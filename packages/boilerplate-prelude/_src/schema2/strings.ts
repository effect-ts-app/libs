import { Annotations, Arbitrary, Hook, Schema } from "@effect-ts-app/schema2"
import { pipe } from "@effect-ts/core"
import { customRandom, urlAlphabet } from "nanoid"
import type * as SchemaLegacy from "../schema.js"

const size = 21
const length = 10 * size

export type StringId = SchemaLegacy.StringId

/**
 * A string that is at least 6 characters long and a maximum of 50.
 */
export const StringId: Schema<StringId> = pipe(
  Schema.string
    .minLength(6)
    .maxLength(50)
    .title("ReasonableString")
    .filter((s): s is StringId => !!s)
    .annotations({
      [Annotations.CustomId]: { type: "StringId" },
      [Annotations.ArbitraryHookId]: Hook.hook(() =>
        Arbitrary.make(
          StringId,
          fc =>
            fc.uint8Array({ minLength: length, maxLength: length })
              .map(_ => customRandom(urlAlphabet, size, size => _.subarray(0, size))() as StringId)
        )
      )
    })
)

// make(this: void): StringId {
//   return nanoid() as unknown as StringId
// }
