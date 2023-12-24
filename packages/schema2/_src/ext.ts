/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import type { ROSet } from "@effect-app/core/Prelude"
import type { UUID } from "crypto"
import * as B from "effect/Brand"
import type * as Brand from "effect/Brand"
import type * as Either from "effect/Either"
import type { None, Some } from "effect/Option"
import { Option } from "effect/Option"
import { S } from "./schema.js"

/**
 * @tsplus getter ets/Schema/Schema withDefault
 */
export const withDefaultProp = <To extends SupportedDefaults, From>(
  schema: S.Schema<From, To>
) => defaultProp(schema)

export type SupportedDefaults =
  | ROSet<any>
  | ReadonlyArray<any>
  | Some<any>
  | None<any>
  | Date
  | boolean
  | UUID

export type SupportedDefaultsSchema = S.Schema<any, SupportedDefaults>
export type DefaultProperty = SpecificField<any, any, any, any>

export type DefaultFieldRecord = Record<PropertyKey, DefaultProperty>

export type WithDefault<
  From,
  To extends SupportedDefaults,
  As extends Option<PropertyKey>
> = S.Field<
  S.Schema<From, To>,
  "required",
  As,
  Some<["constructor", () => To]>
>

export type WithInputDefault<
  From,
  To extends SupportedDefaults,
  As extends Option<PropertyKey>
> = S.Field<
  S.Schema<From, To>,
  "required",
  As,
  Some<["both", () => To]>
>

export function withDefault<
  From,
  To extends SupportedDefaults,
  As extends Option<PropertyKey>,
  Def extends Option<
    [
      "parser" | "constructor" | "both",
      () => S.To<
        S.Schema<From, To>
      >
    ]
  >
>(
  p: S.Field<
    S.Schema<From, To>,
    "required",
    As,
    Def
  >
): WithDefault<From, To, As> {
  if (findAnnotation(p._schema, S.dateIdentifier)) {
    return propDef(p, makeCurrentDate as any, "constructor")
  }
  if (findAnnotation(p._schema, S.optionFromNullIdentifier)) {
    return propDef(p, () => Option.none as any, "constructor")
  }
  if (findAnnotation(p._schema, S.nullableIdentifier)) {
    return propDef(p, () => null as any, "constructor")
  }
  if (findAnnotation(p._schema, S.arrayIdentifier)) {
    return propDef(p, () => [] as any, "constructor")
  }
  if (findAnnotation(p._schema, mapIdentifier)) {
    return propDef(p, () => new Map() as any, "constructor")
  }
  if (findAnnotation(p._schema, setIdentifier)) {
    return propDef(p, () => new Set() as any, "constructor")
  }
  if (findAnnotation(p._schema, S.boolIdentifier)) {
    return propDef(p, () => false as any, "constructor")
  }
  if (findAnnotation(p._schema, S.UUIDIdentifier)) {
    return propDef(p, makeUuid as any, "constructor")
  }
  throw new Error("Not supported")
}

export function withInputDefault<
  From,
  To extends SupportedDefaults,
  As extends Option<PropertyKey>,
  Def extends Option<
    [
      "parser" | "constructor" | "both",
      () => S.To<
        S.Schema<From, To>
      >
    ]
  >
>(
  p: S.Field<
    S.Schema<From, To>,
    "required",
    As,
    Def
  >
): WithInputDefault<From, To, As> {
  if (findAnnotation(p._schema, S.dateIdentifier)) {
    return propDef(p, makeCurrentDate as any, "both")
  }
  if (findAnnotation(p._schema, S.optionFromNullIdentifier)) {
    return propDef(p, () => Option.none as any, "both")
  }
  if (findAnnotation(p._schema, S.nullableIdentifier)) {
    return propDef(p, () => null as any, "both")
  }
  if (findAnnotation(p._schema, S.arrayIdentifier)) {
    return propDef(p, () => [] as any, "both")
  }
  if (findAnnotation(p._schema, setIdentifier)) {
    return propDef(p, () => new Set() as any, "both")
  }
  if (findAnnotation(p._schema, S.boolIdentifier)) {
    return propDef(p, () => false as any, "both")
  }
  if (findAnnotation(p._schema, S.UUIDIdentifier)) {
    return propDef(p, makeUuid as any, "both")
  }
  throw new Error("Not supported")
}

export function defaultProp<From, To>(
  schema: S.Schema<From, To>,
  makeDefault: () => To
): S.Field<
  S.Schema<From, To>,
  "required",
  Option.None<any>,
  Some<["constructor", () => To]>
>
export function defaultProp<
  To extends SupportedDefaults,
  ConstructorInput,
  From,
  Api
>(
  schema: S.Schema<From, To>
): SpecificField<
  S.Schema<From, To>,
  "required",
  Option.None<any>,
  Some<["constructor", () => To]>
>
export function defaultProp<From, To>(
  schema: S.Schema<From, To>
): null extends To ? SpecificField<
    S.Schema<From, To>,
    "required",
    Option.None<any>,
    Some<["constructor", () => To]>
  >
  : ["Not a supported type, see SupportedTypes", never]
export function defaultProp<From, To>(
  schema: S.Schema<From, To>,
  makeDefault: () => To
): S.Field<
  S.Schema<From, To>,
  "required",
  Option.None<any>,
  Some<["constructor", () => To]>
>
export function defaultProp<
  To extends SupportedDefaults,
  ConstructorInput,
  From,
  Api
>(
  schema: S.Schema<From, To>
): SpecificField<
  S.Schema<From, To>,
  "required",
  Option.None<any>,
  Some<["constructor", () => To]>
>
export function defaultProp<From, To>(
  schema: S.Schema<From, To>
): null extends To ? SpecificField<
    S.Schema<From, To>,
    "required",
    Option.None<any>,
    Some<["constructor", () => To]>
  >
  : ["Not a supported type, see SupportedTypes", never]
export function defaultProp(
  schema: S.Schema<unknown, any, any, any, any>,
  makeDefault?: () => any
) {
  return makeDefault ? S.defProp(schema, makeDefault) : S.field(schema) >= withDefault
}

export function defaultInputProp<From, To>(
  schema: S.Schema<From, To>,
  makeDefault: () => To
): S.Field<
  S.Schema<From, To>,
  "required",
  Option.None<any>,
  Some<["both", () => To]>
>
export function defaultInputProp<
  To extends SupportedDefaults,
  ConstructorInput,
  From,
  Api
>(
  schema: S.Schema<From, To>
): SpecificField<
  S.Schema<From, To>,
  "required",
  Option.None<any>,
  Some<["both", () => To]>
>
export function defaultInputProp<From, To>(
  schema: S.Schema<From, To>
): null extends To ? SpecificField<
    S.Schema<From, To>,
    "required",
    Option.None<any>,
    Some<["both", () => To]>
  >
  : ["Not a supported type, see SupportedTypes", never]
export function defaultInputProp<From, To>(
  schema: S.Schema<From, To>,
  makeDefault: () => To
): S.Field<
  S.Schema<From, To>,
  "required",
  Option.None<any>,
  Some<["both", () => To]>
>
export function defaultInputProp<
  To extends SupportedDefaults,
  ConstructorInput,
  From,
  Api
>(
  schema: S.Schema<From, To>
): SpecificField<
  S.Schema<From, To>,
  "required",
  Option.None<any>,
  Some<["both", () => To]>
>
export function defaultInputProp<From, To>(
  schema: S.Schema<From, To>
): null extends To ? SpecificField<
    S.Schema<From, To>,
    "required",
    Option.None<any>,
    Some<["both", () => To]>
  >
  : ["Not a supported type, see SupportedTypes", never]
export function defaultInputProp(
  schema: S.Schema<unknown, any, any, any, any>,
  makeDefault?: () => any
) {
  return makeDefault
    ? S.defProp(schema, makeDefault, "both")
    : S.field(schema) >= withInputDefault
}

export interface Constructor<in out A extends B.Brand<any>> {
  readonly [B.RefinedConstructorsTypeId]: B.RefinedConstructorsTypeId
  /**
   * Constructs a branded type from a value of type `A`, throwing an error if
   * the provided `A` is not valid.
   */
  (args: Unbranded<A>): A
  /**
   * Constructs a branded type from a value of type `A`, returning `Some<A>`
   * if the provided `A` is valid, `None` otherwise.
   */
  option(args: Unbranded<A>): Option.Option<A>
  /**
   * Constructs a branded type from a value of type `A`, returning `Right<A>`
   * if the provided `A` is valid, `Left<BrandError>` otherwise.
   */
  either(args: Unbranded<A>): Either.Either<Brand.Brand.BrandErrors, A>
  /**
   * Attempts to refine the provided value of type `A`, returning `true` if
   * the provided `A` is valid, `false` otherwise.
   */
  is(a: Unbranded<A>): a is Unbranded<A> & A
}

export const fromBrand = <C extends Brand.Brand<string | symbol>>(
  constructor: Constructor<C>,
  options?: S.FilterAnnotations<Unbranded<C>>
) =>
<I, A extends Unbranded<C>>(self: S.Schema<I, A>): S.Schema<I, A & C> => {
  return S.fromBrand(constructor as any, options as any)(self as any) as any
}

export type Brands<P> = P extends B.Brand<any> ? { readonly [B.BrandTypeId]: P[B.BrandTypeId] }
  : never

export type Unbranded<P> = P extends infer Q & Brands<P> ? Q : P

export const nominal: <A extends B.Brand<any>>() => Constructor<A> = <
  A extends B.Brand<any>
>(): Constructor<
  A
> => B.nominal<A>() as any

// type GetKeys<U> = U extends Record<infer K, any> ? K : never
// type UnionToIntersection2<U extends object> = {
//   readonly [K in GetKeys<U>]: U extends Record<K, infer T> ? T : never
// }

// export type Test<P extends B.Brand<any>> = {
//   [K in keyof P[B.BrandTypeId]]: K extends string | symbol ? {
//       readonly [k in K]: k
//     }
//     : never
// }[keyof P[B.BrandTypeId]]
// export type UnionToIntersection3<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I
//   : never
