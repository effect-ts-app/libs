import { Effect } from "@effect-app/core"
import { S } from "effect-app"
import type { DiscriminatedUnionFieldInfo, FieldInfo, NestedFieldInfo, UnionFieldInfo } from "../src/form.js"
import { buildFieldInfoFromFieldsRoot } from "../src/form.js"
import { Password, type PasswordSecret } from "./password.test.js"

export class NestedSchema extends S.Class<NestedSchema>()({
  shallow: S.string,
  nested: S.struct({
    deep: S.NonEmptyString,
    nested: S.struct({
      deepest: S.number
    })
  }),
  password: Password
}) {}

type NestedSchemaFrom = S.Schema.Encoded<typeof NestedSchema>
type NestedSchemaTo = S.Schema.Type<typeof NestedSchema>

export class SchemaContainsClass extends S.Class<SchemaContainsClass>()({
  inner: NestedSchema
}) {}

export class UnionSchema extends S.Class<UnionSchema>()({
  generalUnion: S.union(S.string, S.struct({ unionNested: NestedSchema })),
  structsUnion: S.union(NestedSchema, SchemaContainsClass),
  optional: S.optional(S.string),
  nullable: S.nullable(S.string)
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

function testUnionFieldInfo<T>(ufi: UnionFieldInfo<T[]>) {
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
        case "DiscriminatedUnionFieldInfo":
          testDiscriminatedUnionFieldInfo(i as DiscriminatedUnionFieldInfo<any>)
          break
      }
    }
  )
}

function testNestedFieldInfo<T extends Record<PropertyKey, any>>(nfi: NestedFieldInfo<T>) {
  expect(nfi).toBeInstanceOf(Object)
  expect(nfi._tag).toBe("NestedFieldInfo")
  expect(nfi.fields).toBeInstanceOf(Object)

  // remove the value of _infoTag from the object when it is undefined
  // when it isn't undefined, the followin switch will ignore it
  Object.values(nfi).filter(Boolean).forEach(
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
        case "DiscriminatedUnionFieldInfo":
          testDiscriminatedUnionFieldInfo(i as DiscriminatedUnionFieldInfo<any>)
          break
      }
    }
  )
}

function testDiscriminatedUnionFieldInfo<T extends Record<PropertyKey, any>>(dufi: DiscriminatedUnionFieldInfo<T>) {
  expect(dufi).toBeInstanceOf(Object)
  expect(dufi._tag).toBe("DiscriminatedUnionFieldInfo")
  expect(dufi.members).toBeInstanceOf(Object)

  Object.values(dufi.members).forEach(
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
        case "DiscriminatedUnionFieldInfo":
          testDiscriminatedUnionFieldInfo(i as DiscriminatedUnionFieldInfo<any>)
          break
      }
    }
  )
}

it("buildFieldInfo", () =>
  Effect
    .gen(function*() {
      const nestedFieldinfo = buildFieldInfoFromFieldsRoot(NestedSchema)
      console.log((nestedFieldinfo.fields.password as any).rules[1]("5"))

      expectTypeOf(nestedFieldinfo).toEqualTypeOf<NestedFieldInfo<NestedSchema>>()
      expectTypeOf(nestedFieldinfo.fields.shallow).toEqualTypeOf<FieldInfo<string>>()

      // it should be a FieldInfo of something
      expectTypeOf(nestedFieldinfo.fields.password).toEqualTypeOf<NestedFieldInfo<PasswordSecret>>()
      expectTypeOf(nestedFieldinfo.fields.nested).toEqualTypeOf<NestedFieldInfo<NestedSchema["nested"]>>()
      expectTypeOf(nestedFieldinfo.fields.nested.fields.deep).toEqualTypeOf<FieldInfo<string & S.NonEmptyStringBrand>>()
      expectTypeOf(nestedFieldinfo.fields.nested.fields.nested).toEqualTypeOf<
        NestedFieldInfo<NestedSchema["nested"]["nested"]>
      >()
      expectTypeOf(nestedFieldinfo.fields.nested.fields.nested.fields.deepest).toEqualTypeOf<FieldInfo<number>>()

      // it's a recursive check on actual runtime structure
      testNestedFieldInfo(nestedFieldinfo)
      testNestedFieldInfo(nestedFieldinfo.fields.nested)
      testNestedFieldInfo(nestedFieldinfo.fields.password)
    })
    .pipe(Effect.runPromise))

it("buildFieldInfo schema containing class", () =>
  Effect
    .gen(function*() {
      const fieldinfo = buildFieldInfoFromFieldsRoot(SchemaContainsClass)

      // the type system says that these are NestedFieldInfo<NestedSchema>s
      // are they really? let's check
      testNestedFieldInfo(fieldinfo.fields.inner)
      testNestedFieldInfo(fieldinfo.fields.inner.fields.nested.fields.nested)
    })
    .pipe(Effect.runPromise), { skip: true })

it("buildFieldInfo with simple union", () =>
  Effect
    .gen(function*() {
      const unionFieldinfo = buildFieldInfoFromFieldsRoot(UnionSchema)
      expectTypeOf(unionFieldinfo).toEqualTypeOf<NestedFieldInfo<UnionSchema>>()
      expectTypeOf(unionFieldinfo.fields.nullable).toEqualTypeOf<
        FieldInfo<string | null>
      >()
      expectTypeOf(unionFieldinfo.fields.optional).toEqualTypeOf<
        FieldInfo<string | undefined>
      >()
      expectTypeOf(unionFieldinfo.fields.structsUnion).toEqualTypeOf<
        UnionFieldInfo<(NestedFieldInfo<NestedSchema> | NestedFieldInfo<SchemaContainsClass>)[]>
      >()
      expectTypeOf(unionFieldinfo.fields.generalUnion).toEqualTypeOf<
        FieldInfo<
          string | {
            readonly unionNested: NestedSchema
          }
        >
      >

      // it's a recursive check on actual runtime structure
      testNestedFieldInfo(unionFieldinfo)
      testFieldInfo(unionFieldinfo.fields.nullable)
      testFieldInfo(unionFieldinfo.fields.optional)
      testUnionFieldInfo(unionFieldinfo.fields.structsUnion)
      testFieldInfo(unionFieldinfo.fields.generalUnion)
    })
    .pipe(Effect.runPromise), { skip: true })

it("buildFieldInfo with tagged unions", () =>
  Effect
    .gen(function*() {
      const shapeFieldinfo = buildFieldInfoFromFieldsRoot(ShapeContainer)

      // check at runtime if the structure is really an union
      testDiscriminatedUnionFieldInfo(shapeFieldinfo.fields.shapeWithClasses)
      testDiscriminatedUnionFieldInfo(shapeFieldinfo.fields.shapeWithStruct)

      testNestedFieldInfo(shapeFieldinfo.fields.shapeWithClasses.members.Square)
      expect(shapeFieldinfo.fields.shapeWithClasses.members.Square._infoTag).toBe("Square")
      testFieldInfo(shapeFieldinfo.fields.shapeWithClasses.members.Square.fields.sideLength)

      testNestedFieldInfo(shapeFieldinfo.fields.shapeWithClasses.members.Triangle)
      expect(shapeFieldinfo.fields.shapeWithClasses.members.Triangle._infoTag).toBe("Triangle")
      testFieldInfo(shapeFieldinfo.fields.shapeWithClasses.members.Triangle.fields.base)
      testFieldInfo(shapeFieldinfo.fields.shapeWithClasses.members.Triangle.fields.height)

      testNestedFieldInfo(shapeFieldinfo.fields.shapeWithClasses.members.Circle)
      expect(shapeFieldinfo.fields.shapeWithClasses.members.Circle._infoTag).toBe("Circle")
      testFieldInfo(shapeFieldinfo.fields.shapeWithClasses.members.Circle.fields.radius)

      testNestedFieldInfo(shapeFieldinfo.fields.shapeWithStruct.members.SquareStruct)
      expect(shapeFieldinfo.fields.shapeWithStruct.members.SquareStruct._infoTag).toBe("SquareStruct")
      testFieldInfo(shapeFieldinfo.fields.shapeWithStruct.members.SquareStruct.fields.sideLength)

      testNestedFieldInfo(shapeFieldinfo.fields.shapeWithStruct.members.TriangleStruct)
      expect(shapeFieldinfo.fields.shapeWithStruct.members.TriangleStruct._infoTag).toBe("TriangleStruct")
      testFieldInfo(shapeFieldinfo.fields.shapeWithStruct.members.TriangleStruct.fields.base)
      testFieldInfo(shapeFieldinfo.fields.shapeWithStruct.members.TriangleStruct.fields.height)

      testNestedFieldInfo(shapeFieldinfo.fields.shapeWithStruct.members.CircleStruct)
      expect(shapeFieldinfo.fields.shapeWithStruct.members.CircleStruct._infoTag).toBe("CircleStruct")
      testFieldInfo(shapeFieldinfo.fields.shapeWithStruct.members.CircleStruct.fields.radius)
    })
    .pipe(Effect.runPromise), { skip: true })
