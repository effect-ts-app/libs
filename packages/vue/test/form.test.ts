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

// class Circle extends S.TaggedClass<Circle>()("Circle", {
//   radius: S.number
// }) {}

// class Square extends S.TaggedClass<Square>()("Square", {
//   sideLength: S.number
// }) {}

// class Triangle extends S.TaggedClass<Triangle>()("Triangle", {
//   base: S.number,
//   height: S.number
// }) {}

const CircleStruct = S.struct({
  _tag: S.literal("CircleStruct"),
  radius: S.number
})

const SquareStruct = S.struct({
  _tag: S.literal("SquareStruct"),
  sideLength: S.number
})

const TriangleStruct = S.struct({
  _tag: S.literal("TriangleStruct"),
  base: S.number,
  height: S.number
})

const ShapeWithStructs = S.union(CircleStruct, SquareStruct, TriangleStruct)

export class ShapeContainer extends S.Class<ShapeContainer>()({
  shape: ShapeWithStructs
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
      expectTypeOf(nestedFieldInfos.shallow).toEqualTypeOf<FieldInfo<string>>()
      expectTypeOf(nestedFieldInfos.nested).toEqualTypeOf<NestedFieldInfo<NestedSchema["nested"]>>()
      expectTypeOf(nestedFieldInfos.nested.deep).toEqualTypeOf<FieldInfo<string & S.NonEmptyStringBrand>>()
      expectTypeOf(nestedFieldInfos.nested.nested).toEqualTypeOf<NestedFieldInfo<NestedSchema["nested"]["nested"]>>()
      expectTypeOf(nestedFieldInfos.nested.nested.deepest).toEqualTypeOf<FieldInfo<number>>()

      // it's a recursive check on actual runtime structure
      testNestedFieldInfo(nestedFieldInfos)
    })
    .pipe(Effect.runPromise))

it("buildFieldInfo schema containing class schema", () =>
  Effect
    .gen(function*() {
      const nestedFieldInfos = buildFieldInfoFromFields(NestedSchema)
      expectTypeOf(nestedFieldInfos).toEqualTypeOf<NestedFieldInfo<NestedSchema>>()
      expectTypeOf(nestedFieldInfos.shallow).toEqualTypeOf<FieldInfo<string>>()
      expectTypeOf(nestedFieldInfos.nested).toEqualTypeOf<NestedFieldInfo<NestedSchema["nested"]>>()
      expectTypeOf(nestedFieldInfos.nested.deep).toEqualTypeOf<FieldInfo<string & S.NonEmptyStringBrand>>()
      expectTypeOf(nestedFieldInfos.nested.nested).toEqualTypeOf<NestedFieldInfo<NestedSchema["nested"]["nested"]>>()
      expectTypeOf(nestedFieldInfos.nested.nested.deepest).toEqualTypeOf<FieldInfo<number>>()

      // it's a recursive check on actual runtime structure
      testNestedFieldInfo(nestedFieldInfos)
    })
    .pipe(Effect.runPromise))

it("buildFieldInfo with simple union", () =>
  Effect
    .gen(function*() {
      const fieldInfos = buildFieldInfoFromFields(SchemaContainsClass)

      // the type system says that this is a NestedFieldInfo<NestedSchema>
      // is it really?
      testNestedFieldInfo(fieldInfos.inner)

      // it's a recursive check on actual runtime structure
    })
    .pipe(Effect.runPromise))

it("buildFieldInfo with tagged union", () =>
  Effect
    .gen(function*() {
      const shapeFieldInfos = buildFieldInfoFromFields(ShapeContainer)

      testNestedFieldInfo(shapeFieldInfos)

      shapeFieldInfos.shape.infos.forEach((i) => {
        expect(["CircleStruct", "SquareStruct", "TriangleStruct"]).toContain(i.___tag)
        switch (i.___tag) {
          case "CircleStruct":
            expectTypeOf(i).toEqualTypeOf<NestedFieldInfo<S.Schema.Type<typeof CircleStruct>>>()
            break
          case "SquareStruct":
            expectTypeOf(i).toEqualTypeOf<NestedFieldInfo<S.Schema.Type<typeof SquareStruct>>>()
            break
          case "TriangleStruct":
            expectTypeOf(i).toEqualTypeOf<NestedFieldInfo<S.Schema.Type<typeof TriangleStruct>>>()
            break
        }
      })
    })
    .pipe(Effect.runPromise))
