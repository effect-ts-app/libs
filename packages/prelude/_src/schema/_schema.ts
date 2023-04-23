/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import { identity } from "@effect-app/core/Function"
import type { AnyError, Parser } from "@effect-app/schema"
import {
  Guard,
  LongString,
  maxLengthIdentifier,
  minLengthIdentifier,
  nullableIdentifier,
  ReasonableString
} from "@effect-app/schema"
import * as S from "@effect-app/schema"
import type * as faker from "faker"
import { fakerToArb, getFaker } from "../faker.js"

export { matchTag } from "@effect-app/core/utils"

/**
 * A little helper to allow writing `interface X extends Identity<typeof Y>`
 * so you don't need an intermediate type for `typeof Y`
 */
export type Identity<T> = T

export function fitIntoReasonableString(str: string) {
  if (Guard.for(ReasonableString)(str)) {
    return str
  }

  return ReasonableString(str.substring(0, 255 - 3) + "...")
}

export function fitIntoLongString(str: string) {
  if (Guard.for(LongString)(str)) {
    return str
  }

  return LongString(str.substring(0, 2047 - 3) + "...")
}

export const fakerArb = (
  gen: (fake: typeof faker) => () => ReturnType<typeof faker.fake>
): (a: any) => S.Arbitrary.Arbitrary<string> => fakerToArb(gen(getFaker()))

export function tryParse<X, A>(self: Parser.Parser<X, AnyError, A>) {
  return (a: X, env?: Parser.ParserEnv) => {
    const res = self(a, env).effect
    if (res._tag === "Left") {
      return Option.none
    }
    const warn = res.right[1]
    if (warn._tag === "Some") {
      return Option.none
    }
    return Option(res.right[0])
  }
}

export function isSchema(
  p: S.SchemaAny | S.AnyProperty
): p is S.SchemaAny {
  return !!(p as any)[S.SchemaSym]
}

export function getMetadataFromSchemaOrProp(p: S.SchemaAny | S.AnyProperty) {
  if (isSchema(p)) {
    return getMetadataFromSchema(p)
  }
  return getMetadataFromProp(p)
}

// 1. get metadata from properties, use it to constrain fields
// 2. use the metadata for custom validation error messges?
// 3. or leverage the actual validation errors that come from parsing the fields.
// function getMetadataFromProp_<Prop extends S.AnyProperty>(p: Prop) {
//   return {
//     required: p._optional === "required",
//   }
// }
export function getMetadataFromProp<Prop extends S.AnyProperty>(p: Prop) {
  const schemaMetadata = getMetadataFromSchema(p._schema)
  // const propMetadata = getMetadataFromProp_(p)

  return schemaMetadata
  // return {
  //   ...schemaMetadata,
  //   required: propMetadata.required && schemaMetadata.required,
  // }
}

const numberIds = [
  S.numberIdentifier
  // S.stringNumberFromStringIdentifier, actually input is string
]
const intIds = [
  S.intIdentifier,
  S.intFromNumberIdentifier
]
const rangeNumberIds = [
  S.rangeIdentifier,
  S.minIdentifier,
  S.maxIdentifier
]

export function getMetadataFromSchema<Self extends S.SchemaAny>(self: Self) {
  const nullable = S.findAnnotation(self, nullableIdentifier)
  const realSelf = nullable?.self ?? self
  const minLength = S.findAnnotation(realSelf, minLengthIdentifier)
  const maxLength = S.findAnnotation(realSelf, maxLengthIdentifier)

  const min = S.findAnnotation(realSelf, S.minIdentifier)
  const max = S.findAnnotation(realSelf, S.maxIdentifier)
  const range = S.findAnnotation(realSelf, S.rangeIdentifier)

  const isNumber = numberIds.some((_) => S.findAnnotation(realSelf, _))
  const isInt = intIds.some((_) => S.findAnnotation(realSelf, _))
  const asMin = min || range
  const asMax = max || range
  const typeN = asMin || asMax
  return {
    type: typeN ? typeN.type : isInt ? "int" as const : isNumber ? "float" as const : "text" as const,
    minimum: asMin?.minimum,
    minimumExclusive: asMin?.minimumExclusive,
    maximum: asMax?.maximum,
    maximumExclusive: asMax?.maximumExclusive,
    minLength: minLength?.minLength,
    maxLength: maxLength?.maxLength,
    required: !nullable
  }
}

export function getRegisterFromSchemaOrProp(p: S.SchemaAny | S.AnyProperty) {
  if (isSchema(p)) {
    return getRegisterFromSchema(p)
  }
  return getRegisterFromProp(p)
}

// 1. get metadata from properties, use it to constrain fields
// 2. use the metadata for custom validation error messges?
// 3. or leverage the actual validation errors that come from parsing the fields.

export function getRegisterFromProp<Prop extends S.AnyProperty>(p: Prop) {
  const schemaMetadata = getRegisterFromSchema(p._schema)
  // const metadata = getMetadataFromProp_(p)

  return {
    ...schemaMetadata
    // optional props should not translate values to undefined, as empty value is not absence
    // ...(!metadata.required
    //   ? {
    //       transform: {
    //         output: (value: any) => (value ? value : undefined),
    //         input: (value: any) => (!value ? "" : value),
    //       },
    //     }
    //   : {}),
  }
}

export function getRegisterFromSchema<Self extends S.SchemaAny>(self: Self) {
  // or take from openapi = number type?
  const metadata = getMetadataFromSchema(self)
  const nullable = S.findAnnotation(self, nullableIdentifier)

  const mapType = numberIds.concat(rangeNumberIds).some((x) => S.findAnnotation(nullable?.self ?? self, x))
    ? ("asNumber" as const)
    : ("normal" as const)
  const map = mapValueType(mapType)

  return {
    ...(!metadata.required
      ? {
        transform: {
          output: (value: any) => map(value === "" ? null : value),
          // for date fields we should not undo null..
          // actually for string fields they appropriately convert to empty string probably anyway, so lets remove
          // input: (value: any) => (value === null || value === undefined ? "" : value),
          input: identity
        }
      }
      : { transform: { output: map, input: identity } })
  }
}

function asNumber(value: any) {
  return value === null || value === undefined
    ? value
    : value === ""
    ? NaN
    : typeof value === "string"
    ? +value.replace(",", ".")
    : +value
}

function asDate(value: any) {
  return value === null || value === undefined ? value : new Date(value)
}

function mapValueType(type: "asNumber" | "asDate" | "normal") {
  return type === "asNumber" ? asNumber : type === "asDate" ? asDate : identity
}

export * from "@effect-app/schema"
export * from "./overrides.js"
export { array, nonEmptyArray, set } from "./overrides.js"
