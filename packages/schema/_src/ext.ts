/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import type { Option } from "@effect-app/core/Prelude"
import { typedKeysOf } from "@effect-app/core/utils"
import type { Schema, StructFields } from "@effect/schema/Schema"
import * as B from "effect/Brand"
import type * as Brand from "effect/Brand"
import type * as Either from "effect/Either"
import type { AST } from "./schema.js"
import { S } from "./schema.js"

/**
 * @tsplus fluent effect/schema/Schema withDefault
 */
export const defaultDate = <S extends Schema<any, Date>>(s: S) => S.withDefaultConstructor(s, () => new Date())

/**
 * @tsplus fluent effect/schema/Schema withDefault
 */
export const defaultBool = <S extends Schema<any, boolean>>(s: S) => S.withDefaultConstructor(s, () => false)

/**
 * @tsplus fluent effect/schema/Schema withDefault
 */
export const defaultNullable = <S extends Schema<any, any>, From, To>(s: S & Schema<From, To | null>) =>
  S.withDefaultConstructor(s, () => null)

/**
 * @tsplus fluent effect/schema/Schema withDefault
 */
export const defaultArray = <S extends Schema<any, ReadonlyArray<any>>>(s: S) => S.withDefaultConstructor(s, () => [])

/**
 * @tsplus fluent effect/schema/Schema withDefault
 */
export const defaultMap = <S extends Schema<any, ReadonlyMap<any, any>>>(s: S) =>
  S.withDefaultConstructor(s, () => new Map())

/**
 * @tsplus fluent effect/schema/Schema withDefault
 */
export const defaultSet = <S extends Schema<any, ReadonlySet<any>>>(s: S) =>
  S.withDefaultConstructor(s, () => new Set())

/**
 * @tsplus getter effect/schema/Schema withDefaults
 */
export const withDefaults = <Self extends S.Schema<any, any>>(s: Self) => {
  const a = Object.assign(S.decodeSync(s) as WithDefaults<Self>, s)
  Object.setPrototypeOf(a, Object.getPrototypeOf(s))
  return a

  // return s as Self & WithDefaults<Self>
}

export const literal = <Literals extends ReadonlyArray<AST.LiteralValue>>(
  ...literals: Literals
) => Object.assign(S.literal(...literals) as Schema<Literals[number]>, { literals })

export type WithDefaults<Self extends S.Schema<any, any>> = (
  i: S.Schema.From<Self>,
  options?: AST.ParseOptions
) => S.Schema.To<Self>

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

export const inputDate = S.union(S.ValidDateFromSelf, S.Date)

export interface UnionBrand {}

export function makeOptional<NER extends StructFields>(
  t: NER // TODO: enforce non empty
): {
  [K in keyof NER]: S.PropertySignature<
    Schema.From<NER[K]> | undefined,
    true,
    Schema.From<NER[K]> | undefined,
    true
  >
} {
  return typedKeysOf(t).reduce((prev, cur) => {
    prev[cur] = S.optional(t[cur] as any)
    return prev
  }, {} as any)
}
