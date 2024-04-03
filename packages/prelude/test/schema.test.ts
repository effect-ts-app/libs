// import { generateFromArbitrary } from "@effect-app/infra/test.arbs"
import { JSONSchema } from "@effect/schema"
import { ReadonlyArray, S } from "effect-app"
import { test } from "vitest"

const A = S.struct({ a: S.NonEmptyString255, email: S.nullable(S.Email) })
test("works", () => {
  console.log(S.StringId.make())
  // console.log(generateFromArbitrary(S.A.make(A)).value)
  console.log(S.AST.getTitleAnnotation(S.Email.ast))
  console.log(S.AST.getDescriptionAnnotation(S.Email.ast))
  console.log(S.AST.getJSONSchemaAnnotation(S.Email.ast))
  console.log(JSONSchema.make(S.Email))
  console.log(S.decodeEither(A, { errors: "all" })({ a: ReadonlyArray.range(1, 256).join(""), email: "hello" }))
})
