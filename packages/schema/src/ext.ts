/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Effect } from "@effect-app/core"
import { extendM } from "@effect-app/core/utils"
import type { Schema } from "@effect/schema/Schema"
import * as S from "@effect/schema/Schema"
import { flow } from "effect"
import type { AST, ParseResult } from "./index.js"

export const Date = Object.assign(S.Date, {
  withDefault: S.propertySignature(S.Date, { default: () => new global.Date() })
})
export const boolean = Object.assign(S.boolean, {
  withDefault: S.propertySignature(S.boolean, { default: () => false })
})
export const number = Object.assign(S.number, { withDefault: S.propertySignature(S.number, { default: () => 0 }) })

/**
 * Like the default Schema `struct` but with batching enabled by default
 */
export const struct = flow(
  S.struct,
  S.batching(true)
)

/**
 * Like the default Schema `tuple` but with batching enabled by default
 */
export const tuple = flow(
  S.tuple,
  S.batching(true)
)

/**
 * Like the default Schema `nonEmptyArray` but with batching enabled by default
 */
export const nonEmptyArray = flow(
  S.nonEmptyArray,
  S.batching(true)
)

/**
 * Like the default Schema `array` but with `withDefault` and batching enabled by default
 */
export const array = flow(
  S.array,
  S.batching(true),
  (s) => Object.assign(s, { withDefault: S.propertySignature(s, { default: () => [] }) })
)

/**
 * Like the default Schema `readonlySet` but with `withDefault` and batching enabled by default
 */
export const readonlySet = flow(
  S.readonlySet,
  S.batching(true),
  (s) => Object.assign(s, { withDefault: S.propertySignature(s, { default: () => new Set() }) })
)

/**
 * Like the default Schema `readonlyMap` but with `withDefault` and batching enabled by default
 */
export const readonlyMap = flow(
  S.readonlyMap,
  S.batching(true),
  (s) => Object.assign(s, { withDefault: S.propertySignature(s, { default: () => new Map() }) })
)

/**
 * Like the default Schema `record` but with `withDefault`
 */
export const nullable = flow(
  S.nullable,
  (s) => Object.assign(s, { withDefault: S.propertySignature(s, { default: () => null }) })
)

export const defaultDate = <S extends Schema<Date, any, any>>(s: S) =>
  S.propertySignature(s, { default: () => new global.Date() as any }) // }TODO

export const defaultBool = <S extends Schema<boolean, any, any>>(s: S) =>
  S.propertySignature(s, { default: () => false as any }) // }TODO

export const defaultNullable = <S extends Schema<any, any, any>, From, To>(
  s: S & Schema<To | null, From, Schema.Context<S>>
) => S.propertySignature(s, { default: () => null as any }) // }TODO

export const defaultArray = <S extends Schema<ReadonlyArray<any>, any, any>>(s: S) =>
  S.propertySignature(s, { default: () => [] as any }) // }TODO

export const defaultMap = <S extends Schema<ReadonlyMap<any, any>, any, any>>(s: S) =>
  S.propertySignature(s, { default: () => new Map() as any }) // }TODO

export const defaultSet = <S extends Schema<ReadonlySet<any>, any, any>>(s: S) =>
  S.propertySignature(s, { default: () => new Set() as any }) // }TODO

/**
 * @tsplus getter effect/schema/Schema withDefaults
 */
export const withDefaults = <Self extends S.Schema<any, any, never>>(s: Self) => {
  const a = Object.assign(S.decodeSync(s) as WithDefaults<Self>, s)
  Object.setPrototypeOf(a, Object.getPrototypeOf(s))
  return a

  // return s as Self & WithDefaults<Self>
}

/**
 * Like the original Schema `literal`, but with `literals` property exposed
 */
export const literal = <Literals extends ReadonlyArray<AST.LiteralValue>>(
  ...literals: Literals
) => Object.assign(S.literal(...literals) as Schema<Literals[number]>, { literals })

export type WithDefaults<Self extends S.Schema<any, any, never>> = (
  i: S.Schema.Encoded<Self>,
  options?: AST.ParseOptions
) => S.Schema.Type<Self>

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

export const inputDate = extendM(
  S.union(S.ValidDateFromSelf, S.Date),
  (s) => ({ withDefault: S.propertySignature(s, { default: () => new global.Date() }) })
)

export interface UnionBrand {}

// export function makeOptional<NER extends Struct.Fields>(
//   t: NER // TODO: enforce non empty
// ): {
//   [K in keyof NER]: S.PropertySignature<
//     Schema.Encoded<NER[K]> | undefined,
//     true,
//     Schema.Type<NER[K]> | undefined,
//     true,
//     Schema.Context<NER[K]>
//   >
// } {
//   return typedKeysOf(t).reduce((prev, cur) => {
//     prev[cur] = S.optional(t[cur] as any)
//     return prev
//   }, {} as any)
// }

// export function makeExactOptional<NER extends Struct.Fields>(
//   t: NER // TODO: enforce non empty
// ): {
//   [K in keyof NER]: S.PropertySignature<
//     Schema.Encoded<NER[K]>,
//     true,
//     Schema.Type<NER[K]>,
//     true,
//     Schema.Context<NER[K]>
//   >
// } {
//   return typedKeysOf(t).reduce((prev, cur) => {
//     prev[cur] = S.optional(t[cur] as any, { exact: true })
//     return prev
//   }, {} as any)
// }

/** A version of transform which is only a one way mapping of From->To */
export const transformTo = <To extends Schema.Any, From extends Schema.Any>(
  from: From,
  to: To,
  decode: (
    fromA: Schema.Type<From>,
    options: AST.ParseOptions,
    ast: AST.Transformation
  ) => Schema.Encoded<To>
) =>
  S.transformOrFail<To, From, never, never>(
    from,
    to,
    (...args) => Effect.sync(() => decode(...args)),
    () => Effect.die("one way schema")
  )

/** A version of transformOrFail which is only a one way mapping of From->To */
export const transformToOrFail = <To extends Schema.Any, From extends Schema.Any, RD>(
  from: From,
  to: To,
  decode: (
    fromA: Schema.Type<From>,
    options: AST.ParseOptions,
    ast: AST.Transformation
  ) => Effect.Effect<Schema.Encoded<To>, ParseResult.ParseIssue, RD>
) => S.transformOrFail<To, From, RD, never>(from, to, decode, () => Effect.die("one way schema"))
