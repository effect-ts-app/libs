import { Effect } from "@effect-app/core"
import { S } from "effect-app"
import type { FieldInfo, NestedFieldInfo, UnionFieldInfo } from "../src/form.js"
import { buildFieldInfoFromFields } from "../src/form.js"

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
  expect(fi._tag).toBe("FieldInfo")
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
  expect(ufi._tag).toBe("UnionFieldInfo")
  expect(ufi.info).toBeInstanceOf(Array)
  ufi.info.forEach(
    (
      i: any
    ) => {
      switch (i._tag) {
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

function testNestedFieldInfo(nfi: NestedFieldInfo<Record<PropertyKey, any>>) {
  expect(nfi).toBeInstanceOf(Object)
  expect(nfi._tag).toBe("NestedFieldInfo")
  expect(nfi.info).toBeInstanceOf(Object)

  Object.values(nfi).forEach(
    (
      i: any
    ) => {
      switch (i._tag) {
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
      const nestedFieldinfo = buildFieldInfoFromFields(NestedSchema)
      expectTypeOf(nestedFieldinfo).toEqualTypeOf<NestedFieldInfo<NestedSchema>>()
      expectTypeOf(nestedFieldinfo.info.shallow).toEqualTypeOf<FieldInfo<string>>()
      expectTypeOf(nestedFieldinfo.info.nested).toEqualTypeOf<NestedFieldInfo<NestedSchema["nested"]>>()
      expectTypeOf(nestedFieldinfo.info.nested.info.deep).toEqualTypeOf<FieldInfo<string & S.NonEmptyStringBrand>>()
      expectTypeOf(nestedFieldinfo.info.nested.info.nested).toEqualTypeOf<
        NestedFieldInfo<NestedSchema["nested"]["nested"]>
      >()
      expectTypeOf(nestedFieldinfo.info.nested.info.nested.info.deepest).toEqualTypeOf<FieldInfo<number>>()

      // it's a recursive check on actual runtime structure
      testNestedFieldInfo(nestedFieldinfo)
    })
    .pipe(Effect.runPromise))

it("buildFieldInfo schema containing class", () =>
  Effect
    .gen(function*() {
      const fieldinfo = buildFieldInfoFromFields(SchemaContainsClass)

      // the type system says that these are NestedFieldInfo<NestedSchema>s
      // are they really? let's check
      testNestedFieldInfo(fieldinfo.info.inner)
      testNestedFieldInfo(fieldinfo.info.inner.info.nested.info.nested)
    })
    .pipe(Effect.runPromise))

it("buildFieldInfo with simple union", () =>
  Effect
    .gen(function*() {
      const unionFieldinfo = buildFieldInfoFromFields(UnionSchema)
      expectTypeOf(unionFieldinfo).toEqualTypeOf<NestedFieldInfo<UnionSchema>>()
      expectTypeOf(unionFieldinfo.info.union).toEqualTypeOf<
        UnionFieldInfo<(
          | FieldInfo<string>
          | NestedFieldInfo<{
            readonly unionNested: NestedSchema
          }>
        )[]>
      >()
      expectTypeOf(unionFieldinfo.info.union.info).toEqualTypeOf<(
        | FieldInfo<string>
        | NestedFieldInfo<{
          readonly unionNested: NestedSchema
        }>
      )[]>()

      // it's a recursive check on actual runtime structure

      testNestedFieldInfo(unionFieldinfo)
    })
    .pipe(Effect.runPromise))

it("buildFieldInfo with tagged unions", () =>
  Effect
    .gen(function*() {
      const shapeFieldinfo = buildFieldInfoFromFields(ShapeContainer)

      // check at runtime if the structure is really an union
      testUnionFieldInfo(shapeFieldinfo.info.shapeWithClasses)
      testUnionFieldInfo(shapeFieldinfo.info.shapeWithStruct)

      shapeFieldinfo.info.shapeWithStruct.info.forEach((i) => {
        expect(["CircleStruct", "SquareStruct", "TriangleStruct"]).toContain(i._infoTag)
        testNestedFieldInfo(i)
        switch (i._infoTag) {
          case "CircleStruct":
            expectTypeOf(i.info).toEqualTypeOf<NestedFieldInfo<S.Schema.Type<typeof CircleStruct>>["info"]>()
            // manual check of runtime structure
            testFieldInfo(i.info._tag)
            testFieldInfo(i.info.radius)
            break
          case "SquareStruct":
            expectTypeOf(i.info).toEqualTypeOf<NestedFieldInfo<S.Schema.Type<typeof SquareStruct>>["info"]>()
            // manual check of runtime structure
            testFieldInfo(i.info._tag)
            testFieldInfo(i.info.sideLength)
            break
          case "TriangleStruct":
            expectTypeOf(i.info).toEqualTypeOf<NestedFieldInfo<S.Schema.Type<typeof TriangleStruct>>["info"]>()
            // manual check of runtime structure
            testFieldInfo(i.info._tag)
            testFieldInfo(i.info.base)
            testFieldInfo(i.info.height)
            break
        }
      })

      // check if inner classes are correctly tagged
      shapeFieldinfo.info.shapeWithClasses.info.forEach((i) => {
        expect(["Circle", "Square", "Triangle"]).toContain(i._infoTag)
        testNestedFieldInfo(i)

        switch (i._infoTag) {
          case "Circle":
            expectTypeOf(i.info).toEqualTypeOf<NestedFieldInfo<Circle>["info"]>()
            // manual check of runtime structure
            testFieldInfo(i.info._tag)
            testFieldInfo(i.info.radius)
            break
          case "Square":
            expectTypeOf(i.info).toEqualTypeOf<NestedFieldInfo<Square>["info"]>()
            // manual check of runtime structure
            testFieldInfo(i.info._tag)
            testFieldInfo(i.info.sideLength)
            break
          case "Triangle":
            expectTypeOf(i.info).toEqualTypeOf<NestedFieldInfo<Triangle>["info"]>()
            // manual check of runtime structure
            testFieldInfo(i.info._tag)
            testFieldInfo(i.info.base)
            testFieldInfo(i.info.height)
            break
        }
      })
    })
    .pipe(Effect.runPromise))
