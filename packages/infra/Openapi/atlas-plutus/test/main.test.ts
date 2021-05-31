import * as T from "@effect-ts/core/Effect"
import { makeRef } from "@effect-ts/core/Effect/Ref"
import { pipe } from "@effect-ts/core/Function"
import * as MO from "@effect-ts/morphic"

import type { SubSchema } from "../"
import * as Api from "../"
import { References } from "../"

const A = MO.make((F) =>
  F.interface(
    {
      _tag: F.stringLiteral("A"),
      a: F.string({
        conf: {
          [Api.SchemaURI]: (_) =>
            Api.succeed({ type: "string", description: "my description" }),
        },
      }),
      b: F.number(),
      c: F.date(),
    },
    {
      extensions: {
        openapiRef: "RefA",
      },
    }
  )
)
const B = MO.make((F) =>
  F.interface(
    {
      _tag: F.stringLiteral("B"),
      a: F.string(),
      b: F.number(),
      c: F.date(),
    },
    {
      extensions: {
        openapiRef: "RefB",
      },
    }
  )
)
const C = MO.makeADT("_tag")({ A, B })

describe("Morphic OpenAPI Schemas", () => {
  it("should derive schema", async () => {
    expect(
      await pipe(
        T.gen(function* (_) {
          const ref = yield* _(
            makeRef<Map<string, Api.JSONSchema | SubSchema>>(new Map())
          )
          const withRef = T.provideService(References)({ ref })
          return yield* _(withRef(Api.schema(A)))
        }),
        T.runPromise
      )
    ).toEqual({
      $ref: "#/components/schemas/RefA",
    })
  })
  it("should derive schema union", async () => {
    expect(
      await pipe(
        T.gen(function* (_) {
          const ref = yield* _(
            makeRef<Map<string, Api.JSONSchema | SubSchema>>(new Map())
          )
          const withRef = T.provideService(References)({ ref })
          return yield* _(withRef(Api.schema(C)))
        }),
        T.runPromise
      )
    ).toEqual({
      oneOf: [
        {
          $ref: "#/components/schemas/RefA",
        },
        {
          $ref: "#/components/schemas/RefB",
        },
      ],
      discriminator: {
        propertyName: "_tag",
      },
    })
  })
})
