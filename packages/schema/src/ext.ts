/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import type { NonEmptyReadonlyArray } from "@effect-app/core"
import { Effect, pipe } from "@effect-app/core"
import { extendM, typedKeysOf } from "@effect-app/core/utils"
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
export function struct<Fields extends S.Struct.Fields, const Records extends S.IndexSignature.NonEmptyRecords>(
  fields: Fields,
  ...records: Records
): S.typeLiteral<Fields, Records>
export function struct<Fields extends S.Struct.Fields>(fields: Fields): S.struct<Fields>
export function struct<Fields extends S.Struct.Fields, const Records extends S.IndexSignature.Records>(
  fields: Fields,
  ...records: Records
): S.typeLiteral<Fields, Records> {
  return S.struct(fields, ...records as any).pipe(S.batching(true))
}

/**
 * Like the default Schema `tuple` but with batching enabled by default
 */
export function tuple<
  const Elements extends S.TupleType.Elements,
  Rest extends NonEmptyReadonlyArray<Schema.Any>
>(elements: Elements, ...rest: Rest): S.tupleType<Elements, Rest>
export function tuple<Elements extends S.TupleType.Elements>(...elements: Elements): S.tuple<Elements>
export function tuple(...args: ReadonlyArray<any>): any {
  return S.tuple(...args).pipe(S.batching(true))
}

/**
 * Like the default Schema `nonEmptyArray` but with batching enabled by default
 */
export function nonEmptyArray<Value extends Schema.Any>(value: Value): S.nonEmptyArray<Value> {
  return pipe(
    S.nonEmptyArray(value),
    S.batching(true)
  )
}

/**
 * Like the default Schema `array` but with `withDefault` and batching enabled by default
 */
export function array<Value extends Schema.Any>(value: Value) {
  return pipe(
    S.array(value),
    S.batching(true),
    (s) => Object.assign(s, { withDefault: S.propertySignature(s, { default: () => [] }) })
  )
}

/**
 * Like the default Schema `readonlySet` but with `withDefault` and batching enabled by default
 */
export const readonlySet = <Value extends Schema.Any>(value: Value) =>
  pipe(
    S.readonlySet(value),
    S.batching(true),
    (s) => Object.assign(s, { withDefault: S.propertySignature(s, { default: () => new Set<S.Schema.Type<Value>>() }) })
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

export const defaultDate = <I, R>(s: Schema<Date, I, R>) =>
  S.propertySignature(s, {
    default: () => new global.Date()
  })

export const defaultBool = <I, R>(s: Schema<boolean, I, R>) =>
  S.propertySignature(s, {
    default: () => false
  })

export const defaultNullable = <A, I, R>(
  s: Schema<A | null, I, R>
) => S.propertySignature(s, { default: () => null })

export const defaultArray = <A, I, R>(s: Schema<ReadonlyArray<A>, I, R>) =>
  S.propertySignature(s, { default: () => [] })

export const defaultMap = <A, A2, I, R>(s: Schema<ReadonlyMap<A, A2>, I, R>) =>
  S.propertySignature(s, { default: () => new Map() })

export const defaultSet = <A, I, R>(s: Schema<ReadonlySet<A>, I, R>) =>
  S.propertySignature(s, { default: () => new Set<A>() })

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

const makeOpt = (self: S.PropertySignature.Any, exact?: boolean) => {
  const ast = self.ast
  switch (ast._tag) {
    case "PropertySignatureDeclaration": {
      return new (S as any).$PropertySignature(
        new S.PropertySignatureDeclaration(
          exact ? ast.type : S.orUndefined(S.make(ast.type)).ast,
          true,
          ast.isReadonly,
          ast.annotations,
          ast.defaultConstructor
        )
      )
    }
    case "PropertySignatureTransformation": {
      return new (S as any).$PropertySignature(
        new S.PropertySignatureTransformation(
          new S.FromPropertySignature(
            exact ? ast.from.type : S.orUndefined(S.make(ast.from.type)).ast,
            true,
            ast.from.isReadonly,
            ast.from.annotations
          ),
          new S.ToPropertySignature(
            exact ? ast.to.type : S.orUndefined(S.make(ast.to.type)).ast,
            true,
            ast.to.isReadonly,
            ast.to.annotations,
            ast.to.defaultConstructor
          ),
          ast.decode,
          ast.encode
        )
      )
    }
  }
}

export function makeOptional<NER extends S.Struct.Fields | S.PropertySignature.Any>(
  t: NER // TODO: enforce non empty
): {
  [K in keyof NER]: S.PropertySignature<
    "?:",
    Schema.Type<NER[K]> | undefined,
    never,
    "?:",
    Schema.Encoded<NER[K]> | undefined,
    NER[K] extends S.PropertySignature<any, any, any, any, any, infer Z, any> ? Z : false,
    Schema.Context<NER[K]>
  >
} {
  return typedKeysOf(t).reduce((prev, cur) => {
    if (S.isSchema(t[cur])) {
      prev[cur] = S.optional(t[cur] as any)
    } else {
      prev[cur] = makeOpt(t[cur] as any)
    }
    return prev
  }, {} as any)
}

export function makeExactOptional<NER extends S.Struct.Fields>(
  t: NER // TODO: enforce non empty
): {
  [K in keyof NER]: S.PropertySignature<
    "?:",
    Schema.Type<NER[K]>,
    never,
    "?:",
    Schema.Encoded<NER[K]>,
    NER[K] extends S.PropertySignature<any, any, any, any, any, infer Z, any> ? Z : false,
    Schema.Context<NER[K]>
  >
} {
  return typedKeysOf(t).reduce((prev, cur) => {
    if (S.isSchema(t[cur])) {
      prev[cur] = S.optional(t[cur] as any, { exact: true })
    } else {
      prev[cur] = makeOpt(t[cur] as any)
    }
    return prev
  }, {} as any)
}

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
