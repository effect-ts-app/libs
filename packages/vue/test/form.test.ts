import { Effect } from "@effect-app/core"
import { S } from "effect-app"
import type { FieldInfo, NestedFieldInfo } from "../src/form.js"
import { buildFieldInfoFromFields, FieldInfoTag } from "../src/form.js"

const NestedSchema = S.struct({
  shallow: S.string,
  nested: S.struct({
    deep: S.string,
    nested: S.struct({
      deepest: S.number
    })
  })
})

type NestedSchema = S.Schema.Type<typeof NestedSchema>

function testFieldInfo<T>(fi: FieldInfo<T>) {
  expect(fi).toBeInstanceOf(Object)
  expect(fi[FieldInfoTag]).toBe("FieldInfo")
  expect(["text", "float", "int"]).toContain(fi.type)
  expect(fi.rules).toBeInstanceOf(Array)
  fi.rules.forEach((r) => {
    expect(r).toBeInstanceOf(Function)
  })
  expect(fi.metadata).toBeInstanceOf(Object)
  expect(fi.metadata.maxLength === void 0 || typeof fi.metadata.maxLength === "number").toBeTruthy()
  expect(fi.metadata.minLength === void 0 || typeof fi.metadata.minLength === "number").toBeTruthy()
  expect(typeof fi.metadata.required === "boolean").toBeTruthy()
}

function testNestedFieldInfo(nfi: NestedFieldInfo<any>) {
  expect(nfi).toBeInstanceOf(Object)
  expect(nfi[FieldInfoTag]).toBe("NestedFieldInfo")

  Object.values(nfi).forEach((i) => {
    switch (i[FieldInfoTag]) {
      case "FieldInfo":
        testFieldInfo(i)
        break
      case "NestedFieldInfo":
        testNestedFieldInfo(i)
        break
    }
  })
}

it("buildFieldInfo", () =>
  Effect
    .gen(function*() {
      const nestedFieldInfos = buildFieldInfoFromFields(NestedSchema)

      expectTypeOf(nestedFieldInfos).toEqualTypeOf<NestedFieldInfo<NestedSchema>>()
      expectTypeOf(nestedFieldInfos.shallow).toEqualTypeOf<FieldInfo<string>>()
      expectTypeOf(nestedFieldInfos.nested).toEqualTypeOf<NestedFieldInfo<NestedSchema["nested"]>>()
      expectTypeOf(nestedFieldInfos.nested.deep).toEqualTypeOf<FieldInfo<string>>()
      expectTypeOf(nestedFieldInfos.nested.nested).toEqualTypeOf<NestedFieldInfo<NestedSchema["nested"]["nested"]>>()
      expectTypeOf(nestedFieldInfos.nested.nested.deepest).toEqualTypeOf<FieldInfo<number>>()

      // it's a recursive check on actual runtime structure
      testNestedFieldInfo(nestedFieldInfos)
    })
    .pipe(Effect.runPromise))
