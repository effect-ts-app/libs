/* eslint-disable @typescript-eslint/ban-ts-comment */
// CREDITS:
// https://github.com/sledorze/morphic-ts/blob/master/packages/morphic-json-schema-interpreters/src/json-schema/json-schema.ts

/* eslint-disable no-prototype-builtins */
import { pipe } from "@effect-ts/core/Function"
import * as Lens from "@effect-ts/monocle/Lens"
import * as Prism from "@effect-ts/monocle/Prism"

import type * as A from "@effect-ts/core/Collections/Immutable/Array"

export interface BaseConstructor {
  new <T>(args: /*{} extends T ? void : */ T): T
}

// @ts-expect-error
export const Base: BaseConstructor = class<T> {
  constructor(args?: T) {
    if (typeof args === "object" && args != null) {
      const keys = Object.keys(args)

      for (let i = 0; i < keys.length; i++) {
        // @ts-expect-error
        this[keys[i]!] = args[keys[i]!]
      }
    }
  }
}

export class DescriptionSchema extends Base<{
  description?: string
  summary?: string
  title?: string
  nullable?: boolean
}> {}

export class StringSchema extends Base<
  DescriptionSchema & {
    minLength?: number
    maxLength?: number
    format?:
      | "date-time"
      | "date"
      | "password"
      | "byte"
      | "binary"
      | "bigint"
      | "uuid"
      | "email"
    pattern?: string
  }
> {
  readonly type = "string"
}

export class EnumSchema extends Base<
  DescriptionSchema & {
    enum: A.Array<string>
  }
> {
  readonly type = "string"
}

export interface NumberEnumSchema extends DescriptionSchema {
  type: "number"
  enum: A.Array<number>
}

export const isEnumSchema = (x: JSONSchema): x is EnumSchema =>
  "type" in x && x.type === "string" && Array.isArray((x as EnumSchema).enum)

export class NumberSchema extends Base<
  DescriptionSchema & {
    multipleOf?: number
    minimum?: number
    exclusiveMinimum?: boolean
    maximum?: number
    exclusiveMaximum?: boolean
  }
> {
  readonly type = "number"
}

export class BooleanSchema extends Base<DescriptionSchema> {
  readonly type = "boolean"
}

export class ArraySchema extends Base<
  DescriptionSchema & {
    items: SubSchema | A.Array<SubSchema>
    minItems?: number
    maxItems?: number
    description?: string
  }
> {
  readonly type = "array"
}

export interface Ref {
  $ref: string
}

export const Ref = ($ref: string): Ref => ({ $ref })

export class ObjectSchema extends Base<
  DescriptionSchema & {
    required?: A.Array<string>
    properties?: Record<string, SubSchema>
    additionalProperties?: SubSchema
  }
> {
  readonly type = "object"
}

export const objectSchemaOnRequired = pipe(
  Lens.id<ObjectSchema>(),
  Lens.prop("required")
)

export const isObjectSchema = (x: SubSchema): x is ObjectSchema =>
  "type" in x && x.type === "object"

export const jsonToObjectSchemaPrism = Prism.fromPredicate(isObjectSchema)

export type SubSchema = JSONSchema | Ref

export const SubSchema = (x: SubSchema) => x

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Anything {}

export const Anything: Anything = {}

export class OneOfSchema extends Base<
  DescriptionSchema & {
    oneOf: A.Array<JSONSchema | SubSchema>
    discriminator?: {
      propertyName: string
    }
  }
> {}

export class AllOfSchema extends Base<
  DescriptionSchema & {
    allOf: A.Array<JSONSchema | SubSchema>
    discriminator?: {
      propertyName: string
    }
  }
> {}

export type JSONSchema =
  | StringSchema
  | NumberSchema
  | BooleanSchema
  | ArraySchema
  | ObjectSchema
  | OneOfSchema
  | AllOfSchema
  | (EnumSchema & { $schema?: string })
  | (NumberEnumSchema & { $schema?: number })

export const isTypeObject = (schema: JSONSchema | SubSchema): schema is ObjectSchema =>
  !isTypeRef(schema) &&
  (("type" in schema && schema.type === "object") ||
    schema.hasOwnProperty("properties"))

export const isTypeArray = (schema: JSONSchema | SubSchema): schema is ArraySchema =>
  !isTypeRef(schema) &&
  "type" in schema &&
  schema.type !== undefined &&
  schema.type === "array"

export const isTypeRef = (schema: JSONSchema | SubSchema): schema is Ref =>
  schema.hasOwnProperty("$ref")

export const isnotTypeRef = (schema: JSONSchema | SubSchema): schema is JSONSchema =>
  !schema.hasOwnProperty("$ref")

export const isNotPrimitive = (schema: JSONSchema | SubSchema) =>
  isTypeObject(schema) || isTypeArray(schema) || isTypeRef(schema)

export const isStringSchema = (schema: JSONSchema): schema is StringSchema =>
  "type" in schema && schema.type === "string"

export const isNumberSchema = (schema: JSONSchema): schema is NumberSchema =>
  "type" in schema && schema.type === "number"

export const isBooleanSchema = (schema: JSONSchema): schema is BooleanSchema =>
  "type" in schema && schema.type === "boolean"

export const isPrimitive = (
  schema: JSONSchema | SubSchema
): schema is StringSchema | NumberSchema | BooleanSchema =>
  !isTypeRef(schema) &&
  (isStringSchema(schema) || isNumberSchema(schema) || isBooleanSchema(schema))

export const isObjectOrRef = (
  schema: JSONSchema | SubSchema
): schema is Ref | ObjectSchema => isTypeRef(schema) || isObjectSchema(schema)

export const isNamed = (schema: JSONSchema | SubSchema) =>
  !isTypeRef(schema) && "type" in schema && schema.description !== undefined
