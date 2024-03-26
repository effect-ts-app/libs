import { Effect } from "@effect-app/core"
import { S } from "effect-app"
import { buildFieldInfoFromFields } from "../src/form.js"

const NestedSchema = S.struct({
  shallow: S.string,
  nested: S.struct({
    deep: S.string,
    nested: S.struct({
      deepest: S.number
    })
  })
})

it("buildFieldInfo", () =>
  Effect.gen(function*($) {
    const nestedFieldInfos = buildFieldInfoFromFields(NestedSchema)

    nestedFieldInfos.shallow
    nestedFieldInfos.nested
    nestedFieldInfos.nested.deep
    nestedFieldInfos.nested.nested
    nestedFieldInfos.nested.nested.deepest
  }))
