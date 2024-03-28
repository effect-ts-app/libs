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

function testUnionFieldInfo(ufi: UnionFieldInfo<any[]>) {
  expect(ufi).toBeInstanceOf(Object)
  expect(ufi._tag).toBe("UnionFieldInfo")
  expect(ufi.members).toBeInstanceOf(Array)
  ufi.members.forEach(
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
  expect(nfi.fields).toBeInstanceOf(Object)

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
      expectTypeOf(nestedFieldinfo.fields.shallow).toEqualTypeOf<FieldInfo<string>>()
      expectTypeOf(nestedFieldinfo.fields.nested).toEqualTypeOf<NestedFieldInfo<NestedSchema["nested"]>>()
      expectTypeOf(nestedFieldinfo.fields.nested.fields.deep).toEqualTypeOf<FieldInfo<string & S.NonEmptyStringBrand>>()
      expectTypeOf(nestedFieldinfo.fields.nested.fields.nested).toEqualTypeOf<
        NestedFieldInfo<NestedSchema["nested"]["nested"]>
      >()
      expectTypeOf(nestedFieldinfo.fields.nested.fields.nested.fields.deepest).toEqualTypeOf<FieldInfo<number>>()

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
      testNestedFieldInfo(fieldinfo.fields.inner)
      testNestedFieldInfo(fieldinfo.fields.inner.fields.nested.fields.nested)
    })
    .pipe(Effect.runPromise))

it("buildFieldInfo with simple union", () =>
  Effect
    .gen(function*() {
      const unionFieldinfo = buildFieldInfoFromFields(UnionSchema)
      expectTypeOf(unionFieldinfo).toEqualTypeOf<NestedFieldInfo<UnionSchema>>()
      expectTypeOf(unionFieldinfo.fields.union).toEqualTypeOf<
        UnionFieldInfo<(
          | FieldInfo<string>
          | NestedFieldInfo<{
            readonly unionNested: NestedSchema
          }>
        )[]>
      >()
      expectTypeOf(unionFieldinfo.fields.union.members).toEqualTypeOf<(
        | FieldInfo<string>
        | NestedFieldInfo<{
          readonly unionNested: NestedSchema
        }>
      )[]>()

      // it's a recursive check on actual runtime structure
      testNestedFieldInfo(unionFieldinfo)
      testUnionFieldInfo(unionFieldinfo.fields.union)
    })
    .pipe(Effect.runPromise))

it("buildFieldInfo with tagged unions", () =>
  Effect
    .gen(function*() {
      const shapeFieldinfo = buildFieldInfoFromFields(ShapeContainer)

      // check at runtime if the structure is really an union
      testUnionFieldInfo(shapeFieldinfo.fields.shapeWithClasses)
      testUnionFieldInfo(shapeFieldinfo.fields.shapeWithStruct)

      shapeFieldinfo.fields.shapeWithStruct.members.forEach((i) => {
        expect(["CircleStruct", "SquareStruct", "TriangleStruct"]).toContain(i._infoTag)
        testNestedFieldInfo(i)
        switch (i._infoTag) {
          case "CircleStruct":
            expectTypeOf(i.fields).toEqualTypeOf<NestedFieldInfo<S.Schema.Type<typeof CircleStruct>>["fields"]>()
            // manual check of runtime structure
            testFieldInfo(i.fields._tag)
            testFieldInfo(i.fields.radius)
            break
          case "SquareStruct":
            expectTypeOf(i.fields).toEqualTypeOf<NestedFieldInfo<S.Schema.Type<typeof SquareStruct>>["fields"]>()
            // manual check of runtime structure
            testFieldInfo(i.fields._tag)
            testFieldInfo(i.fields.sideLength)
            break
          case "TriangleStruct":
            expectTypeOf(i.fields).toEqualTypeOf<NestedFieldInfo<S.Schema.Type<typeof TriangleStruct>>["fields"]>()
            // manual check of runtime structure
            testFieldInfo(i.fields._tag)
            testFieldInfo(i.fields.base)
            testFieldInfo(i.fields.height)
            break
        }
      })

      // check if inner classes are correctly tagged
      shapeFieldinfo.fields.shapeWithClasses.members.forEach((i) => {
        expect(["Circle", "Square", "Triangle"]).toContain(i._infoTag)
        testNestedFieldInfo(i)

        switch (i._infoTag) {
          case "Circle":
            expectTypeOf(i.fields).toEqualTypeOf<NestedFieldInfo<Circle>["fields"]>()
            // manual check of runtime structure
            testFieldInfo(i.fields._tag)
            testFieldInfo(i.fields.radius)
            break
          case "Square":
            expectTypeOf(i.fields).toEqualTypeOf<NestedFieldInfo<Square>["fields"]>()
            // manual check of runtime structure
            testFieldInfo(i.fields._tag)
            testFieldInfo(i.fields.sideLength)
            break
          case "Triangle":
            expectTypeOf(i.fields).toEqualTypeOf<NestedFieldInfo<Triangle>["fields"]>()
            // manual check of runtime structure
            testFieldInfo(i.fields._tag)
            testFieldInfo(i.fields.base)
            testFieldInfo(i.fields.height)
            break
        }
      })
    })
    .pipe(Effect.runPromise))
