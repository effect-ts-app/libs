/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import { identity } from "@effect-ts-app/core/Function"
import type {
  AnyError,
  ConstructorErrorOf,
  ConstructorInputOf,
  DefaultSchema,
  EncodedOf,
  ParsedShapeOf,
  PropertyRecord,
  Schema,
  SchemaAny,
  schemaField,
  SchemaUPI,
  UnionApi
} from "@effect-ts-app/schema"
import {
  Constructor,
  EParserFor,
  findAnnotation,
  Guard,
  LongString,
  maxLengthIdentifier,
  minLengthIdentifier,
  named,
  nullableIdentifier,
  Parser,
  ReasonableString,
  union as unionOrig,
  unionIdentifier,
  unsafe
} from "@effect-ts-app/schema"
import type * as Th from "@effect-ts-app/schema/custom/These"
import type { EnforceNonEmptyRecord } from "@effect-ts/core/Utils"
import type * as faker from "faker"

import type { ROArray } from "@effect-ts-app/core/Prelude"
import * as S from "@effect-ts-app/schema"
import { fakerToArb, getFaker } from "../faker.js"

export { matchTag } from "@effect-ts/core/Utils"

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

export class CustomSchemaException extends Error {
  readonly _tag = "ValidationError"
  readonly errors: ROArray<unknown>
  constructor(error: S.AnyError) {
    super(S.drawError(error))
    this.errors = [error]
  }

  toJSON() {
    return {
      message: this.message,
      errors: this.errors
    }
  }
}

export const fakerArb = (
  gen: (fake: typeof faker) => () => ReturnType<typeof faker.fake>
): ((a: any) => S.Arbitrary.Arbitrary<string>) => fakerToArb(gen(getFaker()))

/**
 * The Effect fails with `CustomSchemaException` when the parser produces an invalid result.
 * Otherwise succeeds with the valid result.
 */
export function condemnCustom_<X, A>(
  self: Parser.Parser<X, AnyError, A>,
  a: X,
  env?: Parser.ParserEnv
) {
  return Effect.suspendSucceed(() => {
    const res = self(a, env).effect
    if (res._tag === "Left") {
      return Effect.fail(new CustomSchemaException(res.left))
    }
    const warn = res.right.get(1)
    if (warn._tag === "Some") {
      return Effect.fail(new CustomSchemaException(warn.value))
    }
    return Effect(res.right.get(0))
  })
}

/**
 * The Effect fails with the generic `E` type when the parser produces an invalid result
 * Otherwise success with the valid result.
 */
export function condemn_<X, E, A>(
  self: Parser.Parser<X, E, A>,
  x: X,
  env?: Parser.ParserEnv
) {
  return Effect.suspend(() => {
    const y = self(x, env).effect
    if (y._tag === "Left") {
      return Effect.fail(y.left)
    }
    const {
      tuple: [a, w]
    } = y.right
    return w._tag === "Some"
      ? Effect.fail(w.value)
      : Effect(a)
  })
}

export function condemnCustom<X, A>(self: Parser.Parser<X, AnyError, A>) {
  return (a: X, env?: Parser.ParserEnv) => condemnCustom_(self, a, env)
}

export function condemnLeft_<X, A>(
  self: Parser.Parser<X, AnyError, A>,
  a: X,
  env?: Parser.ParserEnv
): Either<CustomSchemaException, A> {
  const res = self(a, env).effect
  if (res._tag === "Left") {
    return Either.left(new CustomSchemaException(res.left))
  }
  const warn = res.right.get(1)
  if (warn._tag === "Some") {
    return Either.left(new CustomSchemaException(warn.value))
  }
  return Either(res.right.get(0))
}

export function condemnLeft<X, A>(self: Parser.Parser<X, AnyError, A>) {
  return (a: X, env?: Parser.ParserEnv) => condemnLeft_(self, a, env)
}

export function parseCondemnCustom_<A, B, C, D, E>(
  self: Schema<A, B, C, D, E>,
  a: A,
  env?: Parser.ParserEnv,
  __trace?: string
) {
  const parser = Parser.for(self)
  return condemnCustom_(parser, a, env)
}

export function parseECondemnCustom_<B, C, D, E>(
  self: Schema<unknown, B, C, D, E>,
  a: D,
  env?: Parser.ParserEnv,
  __trace?: string
) {
  const parser = EParserFor(self)
  return condemnCustom_(parser, a, env)
}

/**
 * The Effect dies with `ThrowableCondemnException` when the parser produces an invalid result.
 * Otherwise succeeds with the valid result.
 */
export function condemnDie_<X, A>(
  self: Parser.Parser<X, AnyError, A>,
  a: X,
  env?: Parser.ParserEnv,
  __trace?: string
) {
  const cl = condemnLeft(self)
  return Effect.fromEither(cl(a, env)).orDie
}

export function parseCondemnDie_<A, B, C, D, E>(
  self: Schema<A, B, C, D, E>,
  a: A,
  env?: Parser.ParserEnv,
  __trace?: string
) {
  const parser = Parser.for(self)
  return condemnDie_(parser, a, env)
}

export function parseECondemnDie_<B, C, D, E>(
  self: Schema<unknown, B, C, D, E>,
  a: D,
  env?: Parser.ParserEnv,
  __trace?: string
) {
  const parser = EParserFor(self)
  return condemnDie_(parser, a, env)
}

export function parseECondemnDie<B, C, D, E>(self: Schema<unknown, B, C, D, E>) {
  const parser = EParserFor(self)
  return (a: D, env?: Parser.ParserEnv) => {
    return condemnDie_(parser, a, env)
  }
}

export function parseECondemnFail<B, C, D, E>(self: Schema<unknown, B, C, D, E>) {
  const parser = EParserFor(self)
  return (a: D, env?: Parser.ParserEnv) => {
    return condemnFail_(parser, a, env)
  }
}
export function parseECondemnLeft<B, C, D, E>(self: Schema<unknown, B, C, D, E>) {
  const parser = EParserFor(self)
  return (a: D, env?: Parser.ParserEnv) => {
    return condemnLeft_(parser, a, env)
  }
}
export function parseECondemnCustom<B, C, D, E>(self: Schema<unknown, B, C, D, E>) {
  const parser = EParserFor(self)
  return (a: D, env?: Parser.ParserEnv) => {
    return condemnCustom_(parser, a, env)
  }
}

export function parseCondemnDie<A, B, C, D, E>(self: Schema<A, B, C, D, E>) {
  const parser = Parser.for(self)
  return (a: A, env?: Parser.ParserEnv) => {
    return condemnDie_(parser, a, env)
  }
}

export function parseCondemnFail<A, B, C, D, E>(self: Schema<A, B, C, D, E>) {
  return (a: A, env?: Parser.ParserEnv) => {
    const parser = Parser.for(self)
    return condemnFail_(parser, a, env)
  }
}
export function parseCondemnLeft<A, B, C, D, E>(self: Schema<A, B, C, D, E>) {
  const parser = Parser.for(self)
  return (a: A, env?: Parser.ParserEnv) => {
    return condemnLeft_(parser, a, env)
  }
}

export function parseCondemnCustom<A, B, C, D, E>(self: Schema<A, B, C, D, E>) {
  const parser = Parser.for(self)
  return (a: A, env?: Parser.ParserEnv) => {
    return condemnCustom_(parser, a, env)
  }
}

export function parseCondemn<A, B, C, D, E>(self: Schema<A, B, C, D, E>) {
  const parser = Parser.for(self)
  return (a: A, env?: Parser.ParserEnv) => {
    return condemn_(parser, a, env)
  }
}

export function parseECondemn_<B, C, D, E>(
  self: Schema<unknown, B, C, D, E>,
  a: D,
  env?: Parser.ParserEnv,
  __trace?: string
) {
  const parser = EParserFor(self)
  return condemn_(parser, a, env)
}

export function parseECondemn<B, C, D, E>(self: Schema<unknown, B, C, D, E>) {
  const parser = EParserFor(self)
  return (a: D, env?: Parser.ParserEnv) => {
    return condemn_(parser, a, env)
  }
}

export function parseUnsafe<A, B, C, D, E>(self: Schema<A, B, C, D, E>) {
  const parser = Parser.for(self)
  const uns = unsafe(parser)
  return (a: A, env?: Parser.ParserEnv) => {
    return uns(a, env)
  }
}

export function parseEUnsafe<B, C, D, E>(self: Schema<unknown, B, C, D, E>) {
  const parser = EParserFor(self)
  const uns = unsafe(parser)
  return (a: D, env?: Parser.ParserEnv) => {
    return uns(a, env)
  }
}

/**
 * The Effect fails with `ThrowableCondemnException` when the parser produces an invalid result.
 * Otherwise succeeds with the valid result.
 */
export function condemnFail_<X, A>(
  self: Parser.Parser<X, AnyError, A>,
  a: X,
  env?: Parser.ParserEnv,
  __trace?: string
) {
  const cl = condemnLeft(self)
  return Effect.fromEither(cl(a, env))
}

export function parseCondemnFail_<A, B, C, D, E>(
  self: Schema<A, B, C, D, E>,
  a: A,
  env?: Parser.ParserEnv,
  __trace?: string
) {
  const parser = Parser.for(self)
  return condemnFail_(parser, a, env)
}

export function parseECondemnFail_<B, C, D, E>(
  self: Schema<unknown, B, C, D, E>,
  a: D,
  env?: Parser.ParserEnv,
  __trace?: string
) {
  const parser = EParserFor(self)
  return condemnFail_(parser, a, env)
}

export function parseCondemnLeft_<A, B, C, D, E>(
  self: Schema<A, B, C, D, E>,
  a: A,
  env?: Parser.ParserEnv
) {
  const parser = Parser.for(self)
  return condemnLeft_(parser, a, env)
}

export function parseECondemnLeft_<B, C, D, E>(
  self: Schema<unknown, B, C, D, E>,
  a: D,
  env?: Parser.ParserEnv
) {
  const parser = EParserFor(self)
  return condemnLeft_(parser, a, env)
}

export function tryParse<X, A>(self: Parser.Parser<X, AnyError, A>) {
  return (a: X, env?: Parser.ParserEnv) => {
    const res = self(a, env).effect
    if (res._tag === "Left") {
      return Maybe.none
    }
    const warn = res.right.get(1)
    if (warn._tag === "Some") {
      return Maybe.none
    }
    return Maybe(res.right.get(0))
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

export function getMetadataFromSchema<Self extends S.SchemaAny>(self: Self) {
  const nullable = S.findAnnotation(self, nullableIdentifier)
  const realSelf = nullable?.self ?? self
  const minLength = S.findAnnotation(realSelf, minLengthIdentifier)
  const maxLength = S.findAnnotation(realSelf, maxLengthIdentifier)

  return {
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
  const numberIds = [
    S.numberIdentifier,
    S.intIdentifier,
    S.intFromNumberIdentifier,
    S.positiveIntIdentifier,
    S.positiveIntFromNumberIdentifier,
    S.positiveIdentifier
  ]

  const metadata = getMetadataFromSchema(self)
  const nullable = S.findAnnotation(self, nullableIdentifier)

  const mapType = numberIds.some(x => S.findAnnotation(nullable?.self ?? self, x))
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

export type SchemaFrom<Cls extends { Model: SchemaAny }> = Cls["Model"]

export type GetProps<Cls extends { Api: { props: PropertyRecord } }> = // Transform<
  Cls["Api"]["props"]

export type GetProvidedProps<
  Cls extends { [schemaField]: { Api: { props: PropertyRecord } } }
> = GetProps<Cls[schemaField]>
// Cls["ProvidedProps"] //Transform<

export type EncodedFromApi<Cls extends { [schemaField]: SchemaAny }> = EncodedOf<
  Cls[schemaField]
> // Transform<
export type ConstructorInputFromApi<Cls extends { [schemaField]: SchemaAny }> = ConstructorInputOf<Cls[schemaField]>
// >

// export type EncodedOf<X extends Schema<any, any, any, any, any>> = Transform<
//   EncodedOfOrig<X>
// >

export type OpaqueEncoded<OpaqueE, Schema> = Schema extends DefaultSchema<
  unknown,
  infer A,
  infer B,
  OpaqueE,
  infer C
> ? DefaultSchema<unknown, A, B, OpaqueE, C>
  : never

// TODO: Add `is` guards (esp. for tagged unions.)
export function smartClassUnion<
  T extends Record<PropertyKey, SchemaUPI & { new(i: any): any }>
>(members: T & EnforceNonEmptyRecord<T>, name?: string) {
  // @ts-expect-error we know this is NonEmpty
  const u = unionOrig(members)
  return enhanceClassUnion(u, name)
}

export function enhanceClassUnion<
  T extends Record<PropertyKey, SchemaUPI & { new(i: any): any }>,
  A,
  E,
  CI
>(u: DefaultSchema<any, A, CI, E, UnionApi<T>>, name?: string) {
  if (name) u = u["|>"](named(name)) as typeof u
  const members = findAnnotation(u, unionIdentifier)!.props as T

  const entries = Object.entries(members)
  const as = entries.reduce((prev, [key, value]) => {
    prev[key] = (i: any) => new value(i)
    return prev
  }, {} as Record<PropertyKey, any>) as any as {
    [Key in keyof T]: (i: ConstructorInputOf<T[Key]>) => A
  }
  const of = entries.reduce((prev, [key, value]) => {
    prev[key] = (i: any) => new value(i)
    return prev
  }, {} as Record<PropertyKey, any>) as any as {
    [Key in keyof T]: (i: ConstructorInputOf<T[Key]>) => InstanceType<T[Key]>
  }

  // Experiment with returning a constructor that returns a Union
  const cas = entries.reduce((prev, [key, value]) => {
    prev[key] = value
    return prev
  }, {} as Record<PropertyKey, any>) as any as {
    [Key in keyof T]: { new(i: ConstructorInputOf<T[Key]>): A }
  }

  const mem = entries.reduce((prev, [key, value]) => {
    prev[key] = value
    return prev
  }, {} as Record<PropertyKey, any>) as any as {
    [Key in keyof T]: T[Key]
  }

  const of_ = (i: A): A => i
  const ext = {
    members,
    cas,
    mem,
    as,
    of,
    of_,
    EParser: EParserFor(u)
  } as SmartClassUnion<T, E, A>
  return Object.assign(u, ext)
}

export interface SmartClassUnion<
  T extends Record<PropertyKey, SchemaUPI & { new(i: any): any }>,
  Encoded,
  ParsedShape
> {
  members: T
  cas: {
    [Key in keyof T]: { new(i: ConstructorInputOf<T[Key]>): ParsedShape }
  }
  mem: {
    [Key in keyof T]: T[Key]
  }
  of: {
    [Key in keyof T]: (i: ConstructorInputOf<T[Key]>) => InstanceType<T[Key]>
  }
  of_: (i: ParsedShape) => ParsedShape
  as: {
    [Key in keyof T]: (i: ConstructorInputOf<T[Key]>) => ParsedShape
  }
  EParser: Parser.Parser<Encoded, any, ParsedShape>
}

export function smartUnion<T extends Record<PropertyKey, SchemaUPI>>(
  members: T & EnforceNonEmptyRecord<T>
) {
  // @ts-expect-error we know this is NonEmpty
  const u = unionOrig(members)
  return enhanceUnion(u)
}

export function enhanceUnion<T extends Record<PropertyKey, SchemaUPI>, A, E, CI>(
  u: DefaultSchema<any, A, CI, E, UnionApi<T>>
) {
  const members = findAnnotation(u, unionIdentifier)!.props as T
  const entries = Object.entries(members)
  // const as = entries.reduce((prev, [key, value]) => {
  //   prev[key] = Constructor.for(value)
  //   return prev
  // }, {} as Record<PropertyKey, any>) as any as {
  //   [Key in keyof T]: (
  //     i: ConstructorInputOf<T[Key]>
  //   ) => Th.These<ConstructorErrorOf<T[Key]>, A>
  // }
  const as = entries.reduce((prev, [key, value]) => {
    prev[key] = Constructor.for(value)
    return prev
  }, {} as Record<PropertyKey, any>) as any as {
    [Key in keyof T]: (
      i: ConstructorInputOf<T[Key]>
    ) => Th.These<ConstructorErrorOf<T[Key]>, A>
  }
  const of = entries.reduce((prev, [key, value]) => {
    prev[key] = Constructor.for(value)["|>"](unsafe)
    return prev
  }, {} as Record<PropertyKey, any>) as any as {
    [Key in keyof T]: (i: ConstructorInputOf<T[Key]>) => ParsedShapeOf<T[Key]> // Th.These<ConstructorErrorOf<T[Key]>, ParsedShapeOf<T[Key]>>
  }
  const mem = entries.reduce((prev, [key, value]) => {
    prev[key] = value
    return prev
  }, {} as Record<PropertyKey, any>) as any as {
    [Key in keyof T]: T[Key]
  }

  const of_ = (i: A): A => i
  const ext = {
    members,
    as,
    mem,
    of,
    of_,
    EParser: EParserFor(u)
  } as SmartUnion<T, E, A>
  return Object.assign(u, ext)
}

export interface SmartUnion<
  T extends Record<PropertyKey, SchemaUPI>,
  Encoded,
  ParsedShape
> {
  members: T
  mem: {
    [Key in keyof T]: T[Key]
  }
  of: {
    [Key in keyof T]: (i: ConstructorInputOf<T[Key]>) => ParsedShapeOf<T[Key]>
  }
  of_: (i: ParsedShape) => ParsedShape
  as: {
    [Key in keyof T]: (
      i: ConstructorInputOf<T[Key]>
    ) => Th.These<ConstructorErrorOf<T[Key]>, ParsedShape>
  }
  EParser: Parser.Parser<Encoded, any, ParsedShape>
}

/**
 * The Either's left is returned with the parser errors when the parser produces an invalid result
 * Otherwise right with the valid result.
 */
export function validate<X, A>(
  self: (a: X) => Th.These<any, A>
): (a: X) => Either<CustomSchemaException, A> {
  return x => {
    const y = self(x).effect
    if (y._tag === "Left") {
      return Either.left(new CustomSchemaException(y.left))
    }
    const {
      tuple: [a, w]
    } = y.right
    return w._tag === "Some"
      ? Either.left(new CustomSchemaException(w.value))
      : Either(a)
  }
}

/**
 * Value: The value you want to submit after validation. e.g for text input: `ReasonableString`
 * InputValue: The internal value of the input, e.g for text input: `string`
 */
export type InputSchema<Value, InputValue> = DefaultSchema<
  unknown,
  Value,
  any,
  InputValue,
  any
>

/**
 * The Either's left is returned with the parser errors when the parser produces an invalid result
 * Otherwise right with the valid result.
 */
export function makeValidator<Value, InputValue>(self: InputSchema<Value, InputValue>) {
  return validate(EParserFor(self))
}

/**
 * The Either's left is returned with the parser errors when the parser produces an invalid result
 * Otherwise right with the valid result.
 */
export function makeValidatorFromUnknown<Value, InputValue>(
  self: InputSchema<Value, InputValue>
) {
  return validate(Parser.for(self))
}

export type ParsedShapeOfCustom<X extends Schema<any, any, any, any, any>> = ReturnType<
  X["_ParsedShape"]
>

// TODO: Opaque UnionApi (return/input type of matchW etc?)
export function OpaqueSchema<A, E = A, CI = A>() {
  function abc<OriginalA, ParserInput, Api>(
    self: DefaultSchema<any, OriginalA, any, any, Api>
  ): DefaultSchema<ParserInput, A, CI, E, Api> & { original: OriginalA }
  function abc<
    OriginalA,
    ParserInput,
    Api,
    A1 extends Record<PropertyKey, SchemaUPI & { new(i: any): any }>,
    A2,
    A3
  >(
    self: DefaultSchema<any, OriginalA, any, any, Api> & SmartClassUnion<A1, A2, A3>
  ):
    & DefaultSchema<ParserInput, A, CI, E, Api>
    & SmartClassUnion<A1, A2, A3>
    & { original: OriginalA }
  // function abc<
  //   ParserInput,
  //   Api,
  //   A1 extends Record<PropertyKey, SchemaUPI & { new (i: any): any }>,
  //   A2,
  //   A3
  // >(
  //   self: DefaultSchema<any, any, any, any, Api> & SmartUnion<A1, A2, A3>
  // ): DefaultSchema<ParserInput, A, CI, E, Api> & SmartUnion<A1, A2, A3>
  function abc(self: any): any {
    return self
  }
  return abc
}

export interface UnionBrand {}

/**
 * Currently does not implement composition, but is useful as a quick set/modify.
 * @tsplus type PreparedLens
 */
export class PreparedLens<S, T> {
  constructor(private readonly s: S, readonly lens: Lens<S, T>) {}
  get = () => this.lens.get(this.s)
  set = (t: T) => this.lens.set_(this.s, t)
}

/**
 * @tsplus fluent PreparedLens modify
 */
export function modify<S, T>(l: PreparedLens<S, T>, mod: (t: T) => T) {
  return l.set(mod(l.get()))
}

export function makePreparedLenses<S, Props extends PropertyRecord>(
  props: Props,
  s: S
): { [K in keyof Props]: PreparedLens<S, ParsedShapeOf<Props[K]["_schema"]>> } {
  function makeLens<T>(l: Lens<S, T>) {
    return new PreparedLens(s, l)
  }
  const id = Lens.id<S>()
  return Object.keys(props).reduce((prev, cur) => {
    prev[cur] = makeLens(id.prop(cur as any))
    return prev
  }, {} as any)
}

export * from "@effect-ts-app/schema"
export * from "./overrides.js"
export { array, nonEmptyArray, set } from "./overrides.js"
