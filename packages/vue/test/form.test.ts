import { Effect } from "@effect-app/core"
import { S } from "effect-app"
import type { FieldInfo, NestedFieldInfo, UnionFieldInfo } from "../src/form.js"
import { buildFieldInfoFromFields, FieldInfoTag } from "../src/form.js"

export class NestedSchema extends S.Class<NestedSchema>()({
  shallow: S.string,
  nested: S.struct({
    deep: S.NonEmptyString,
    nested: S.struct({
      deepest: S.number
    })
  })
}) {}

export class SchemaContainsClass extends S.Class<SchemaContainsClass>()({
  inner: NestedSchema
}) {}

export class UnionSchema extends S.Class<UnionSchema>()({
  union: S.union(S.string, S.struct({ unionNested: NestedSchema }))
}) {}

class Circle extends S.TaggedClass<Circle>()("Circle", {
  radius: S.PositiveInt
}) {}

class Square extends S.TaggedClass<Square>()("Square", {
  sideLength: S.PositiveInt
}) {}

class Triangle extends S.TaggedClass<Triangle>()("Triangle", {
  base: S.PositiveInt,
  height: S.number
}) {}

const CircleStruct = S.struct({
  _tag: S.literal("CircleStruct"),
  radius: S.PositiveInt
})

const SquareStruct = S.struct({
  _tag: S.literal("SquareStruct"),
  sideLength: S.PositiveInt
})

const TriangleStruct = S.struct({
  _tag: S.literal("TriangleStruct"),
  base: S.PositiveInt,
  height: S.number
})

const ShapeWithStructs = S.union(CircleStruct, SquareStruct, TriangleStruct)
const ShapeWithClasses = S.union(Circle, Square, Triangle)

export class ShapeContainer extends S.Class<ShapeContainer>()({
  shapeWithStruct: ShapeWithStructs,
  shapeWithClasses: ShapeWithClasses
}) {}

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

function testUnionFieldInfo(ufi: UnionFieldInfo<any>) {
  expect(ufi).toBeInstanceOf(Object)
  expect(ufi[FieldInfoTag]).toBe("UnionFieldInfo")
  expect(ufi.infos).toBeInstanceOf(Array)
  ufi.infos.forEach(
    (
      i: any
    ) => {
      switch (i[FieldInfoTag]) {
        case "FieldInfo":
          testFieldInfo(i as FieldInfo<any>)
          break
        case "NestedFieldInfo":
          testNestedFieldInfo(i as NestedFieldInfo<any>)
          break
        case "UnionFieldInfo":
          testUnionFieldInfo(i as UnionFieldInfo<any>)
          break
      }
    }
  )
}

function testNestedFieldInfo(nfi: NestedFieldInfo<any>) {
  expect(nfi).toBeInstanceOf(Object)
  expect(nfi[FieldInfoTag]).toBe("NestedFieldInfo")
  expect(nfi.infos).toBeInstanceOf(Object)

  Object.values(nfi).forEach(
    (
      i: any
    ) => {
      switch (i[FieldInfoTag]) {
        case "FieldInfo":
          testFieldInfo(i as FieldInfo<any>)
          break
        case "NestedFieldInfo":
          testNestedFieldInfo(i as NestedFieldInfo<any>)
          break
        case "UnionFieldInfo":
          testUnionFieldInfo(i as UnionFieldInfo<any>)
          break
      }
    }
  )
}

it("buildFieldInfo", () =>
  Effect
    .gen(function*() {
      const nestedFieldInfos = buildFieldInfoFromFields(NestedSchema)
      expectTypeOf(nestedFieldInfos).toEqualTypeOf<NestedFieldInfo<NestedSchema>>()
      expectTypeOf(nestedFieldInfos.infos.shallow).toEqualTypeOf<FieldInfo<string>>()
      expectTypeOf(nestedFieldInfos.infos.nested).toEqualTypeOf<NestedFieldInfo<NestedSchema["nested"]>>()
      expectTypeOf(nestedFieldInfos.infos.nested.infos.deep).toEqualTypeOf<FieldInfo<string & S.NonEmptyStringBrand>>()
      expectTypeOf(nestedFieldInfos.infos.nested.infos.nested).toEqualTypeOf<
        NestedFieldInfo<NestedSchema["nested"]["nested"]>
      >()
      expectTypeOf(nestedFieldInfos.infos.nested.infos.nested.infos.deepest).toEqualTypeOf<FieldInfo<number>>()

      // it's a recursive check on actual runtime structure
      testNestedFieldInfo(nestedFieldInfos)
    })
    .pipe(Effect.runPromise))

it("buildFieldInfo schema containing class", () =>
  Effect
    .gen(function*() {
      const fieldInfos = buildFieldInfoFromFields(SchemaContainsClass)

      // the type system says that these are NestedFieldInfo<NestedSchema>s
      // are they really? let's check
      testNestedFieldInfo(fieldInfos.infos.inner)
      testNestedFieldInfo(fieldInfos.infos.inner.infos.nested.infos.nested)
    })
    .pipe(Effect.runPromise))

it("buildFieldInfo with simple union", () =>
  Effect
    .gen(function*() {
      const unionFieldInfos = buildFieldInfoFromFields(UnionSchema)
      expectTypeOf(unionFieldInfos).toEqualTypeOf<NestedFieldInfo<UnionSchema>>()
      expectTypeOf(unionFieldInfos.infos.union).toEqualTypeOf<
        UnionFieldInfo<(
          | FieldInfo<string>
          | NestedFieldInfo<{
            readonly unionNested: NestedSchema
          }>
        )[]>
      >()
      expectTypeOf(unionFieldInfos.infos.union.infos).toEqualTypeOf<(
        | FieldInfo<string>
        | NestedFieldInfo<{
          readonly unionNested: NestedSchema
        }>
      )[]>()

      // it's a recursive check on actual runtime structure

      testNestedFieldInfo(unionFieldInfos)
    })
    .pipe(Effect.runPromise))

it("buildFieldInfo with tagged unions", () =>
  Effect
    .gen(function*() {
      const shapeFieldInfos = buildFieldInfoFromFields(ShapeContainer)

      // check at runtime if the structure is really an union
      testUnionFieldInfo(shapeFieldInfos.infos.shapeWithClasses)
      testUnionFieldInfo(shapeFieldInfos.infos.shapeWithStruct)

      shapeFieldInfos.infos.shapeWithStruct.infos.forEach((i) => {
        expect(["CircleStruct", "SquareStruct", "TriangleStruct"]).toContain(i.infos.___tag)
        testNestedFieldInfo(i)
        const infos = i.infos
        switch (infos.___tag) {
          case "CircleStruct":
            expectTypeOf(infos).toEqualTypeOf<NestedFieldInfo<S.Schema.Type<typeof CircleStruct>>["infos"]>()
            // manual check of runtime structure
            testFieldInfo(infos._tag)
            testFieldInfo(infos.radius)
            break
          case "SquareStruct":
            expectTypeOf(infos).toEqualTypeOf<NestedFieldInfo<S.Schema.Type<typeof SquareStruct>>["infos"]>()
            // manual check of runtime structure
            testFieldInfo(infos._tag)
            testFieldInfo(infos.sideLength)
            break
          case "TriangleStruct":
            expectTypeOf(infos).toEqualTypeOf<NestedFieldInfo<S.Schema.Type<typeof TriangleStruct>>["infos"]>()
            // manual check of runtime structure
            testFieldInfo(infos._tag)
            testFieldInfo(infos.base)
            testFieldInfo(infos.height)
            break
        }
      })

      // check if inner classes are correctly tagged
      shapeFieldInfos.infos.shapeWithClasses.infos.forEach((i) => {
        expect(["Circle", "Square", "Triangle"]).toContain(i.infos.___tag)
        testNestedFieldInfo(i)
        const infos = i.infos
        switch (infos.___tag) {
          case "Circle":
            expectTypeOf(infos).toEqualTypeOf<NestedFieldInfo<Circle>["infos"]>()
            // manual check of runtime structure
            testFieldInfo(infos._tag)
            testFieldInfo(infos.radius)
            break
          case "Square":
            expectTypeOf(infos).toEqualTypeOf<NestedFieldInfo<Square>["infos"]>()
            // manual check of runtime structure
            testFieldInfo(infos._tag)
            testFieldInfo(infos.sideLength)
            break
          case "Triangle":
            expectTypeOf(infos).toEqualTypeOf<NestedFieldInfo<Triangle>["infos"]>()
            // manual check of runtime structure
            testFieldInfo(infos._tag)
            testFieldInfo(infos.base)
            testFieldInfo(infos.height)
            break
        }
      })
    })
    .pipe(Effect.runPromise))
