/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import type { NonEmptyReadonlyArray } from "@effect-app/core"
import { Effect, pipe } from "@effect-app/core"
import { extendM, typedKeysOf } from "@effect-app/core/utils"
import type { Schema } from "@effect/schema/Schema"
import * as S from "@effect/schema/Schema"
import type { AST, ParseResult } from "./index.js"

export const Date = Object.assign(S.Date, {
  withDefault: S.Date.pipe(S.withDefaultConstructor(() => new global.Date()))
})
export const Boolean = Object.assign(S.Boolean, {
  withDefault: S.Boolean.pipe(S.withDefaultConstructor(() => false))
})
export const Number = Object.assign(S.Number, { withDefault: S.Number.pipe(S.withDefaultConstructor(() => 0)) })

/**
 * Like the default Schema `Struct` but with batching enabled by default
 */
export function Struct<Fields extends S.Struct.Fields, const Records extends S.IndexSignature.NonEmptyRecords>(
  fields: Fields,
  ...records: Records
): S.TypeLiteral<Fields, Records>
export function Struct<Fields extends S.Struct.Fields>(fields: Fields): S.Struct<Fields>
export function Struct<Fields extends S.Struct.Fields, const Records extends S.IndexSignature.Records>(
  fields: Fields,
  ...records: Records
): S.TypeLiteral<Fields, Records> {
  return S.Struct(fields, ...records as any).pipe(S.batching(true))
}

export declare namespace Struct {
  export type Fields = S.Struct.Fields
  export type Type<F extends Fields> = S.Struct.Type<F>
  export type Encoded<F extends Fields> = S.Struct.Encoded<F>
  export type Context<F extends Fields> = Schema.Context<F[keyof F]>
}

/**
 * Like the default Schema `tuple` but with batching enabled by default
 */
export function Tuple<
  const Elements extends S.TupleType.Elements,
  Rest extends NonEmptyReadonlyArray<Schema.Any>
>(elements: Elements, ...rest: Rest): S.TupleType<Elements, Rest>
export function Tuple<Elements extends S.TupleType.Elements>(...elements: Elements): S.Tuple<Elements>
export function Tuple(...args: ReadonlyArray<any>): any {
  return S.Tuple(...args).pipe(S.batching(true))
}

/**
 * Like the default Schema `NonEmptyArray` but with batching enabled by default
 */
export function NonEmptyArray<Value extends Schema.Any>(value: Value): S.NonEmptyArray<Value> {
  return pipe(
    S.NonEmptyArray(value),
    S.batching(true)
  )
}

/**
 * Like the default Schema `Array` but with `withDefault` and batching enabled by default
 */
export function Array<Value extends Schema.Any>(value: Value) {
  return pipe(
    S.Array(value),
    S.batching(true),
    (s) => Object.assign(s, { withDefault: s.pipe(S.withDefaultConstructor(() => [])) })
  )
}

/**
 * Like the default Schema `ReadonlySet` but with `withDefault` and batching enabled by default
 */
export const ReadonlySet = <Value extends Schema.Any>(value: Value) =>
  pipe(
    S.ReadonlySet(value),
    S.batching(true),
    (s) => Object.assign(s, { withDefault: s.pipe(S.withDefaultConstructor(() => new Set<S.Schema.Type<Value>>())) })
  )

/**
 * Like the default Schema `ReadonlyMap` but with `withDefault` and batching enabled by default
 */
export const ReadonlyMap = <K extends Schema.Any, V extends Schema.Any>(pair: {
  readonly key: K
  readonly value: V
}) =>
  pipe(
    S.ReadonlyMap(pair),
    S.batching(true),
    (s) => Object.assign(s, { withDefault: s.pipe(S.withDefaultConstructor(() => new Map())) })
  )

/**
 * Like the default Schema `NullOr` but with `withDefault`
 */
export const NullOr = <S extends Schema.Any>(self: S) =>
  pipe(
    S.NullOr(self),
    (s) => Object.assign(s, { withDefault: s.pipe(S.withDefaultConstructor(() => null)) })
  )

export const defaultDate = <I, R>(s: Schema<Date, I, R>) => s.pipe(S.withDefaultConstructor(() => new global.Date()))

export const defaultBool = <I, R>(s: Schema<boolean, I, R>) => s.pipe(S.withDefaultConstructor(() => false))

export const defaultNullable = <A, I, R>(
  s: Schema<A | null, I, R>
) => s.pipe(S.withDefaultConstructor(() => null))

export const defaultArray = <A, I, R>(s: Schema<ReadonlyArray<A>, I, R>) => s.pipe(S.withDefaultConstructor(() => []))

export const defaultMap = <A, A2, I, R>(s: Schema<ReadonlyMap<A, A2>, I, R>) =>
  s.pipe(S.withDefaultConstructor(() => new Map()))

export const defaultSet = <A, I, R>(s: Schema<ReadonlySet<A>, I, R>) =>
  s.pipe(S.withDefaultConstructor(() => new Set<A>()))

/**
 * @tsplus getter effect/schema/Schema withDefaults
 */
export const withDefaults = <Self extends S.Schema<any, any, never>>(s: Self) => {
  const a = Object.assign(S.decodeSync(s) as WithDefaults<Self>, s)
  Object.setPrototypeOf(a, Object.getPrototypeOf(s))
  return a

  // return s as Self & WithDefaults<Self>
}

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
  S.Union(S.ValidDateFromSelf, S.Date),
  (s) => ({ withDefault: s.pipe(S.withDefaultConstructor(() => new globalThis.Date())) })
)

export interface UnionBrand {}

const makeOpt = (self: S.PropertySignature.Any, exact?: boolean) => {
  const ast = self.ast
  switch (ast._tag) {
    case "PropertySignatureDeclaration": {
      return new (S as any).PropertySignatureImpl(
        new S.PropertySignatureDeclaration(
          exact ? ast.type : S.UndefinedOr(S.make(ast.type)).ast,
          true,
          ast.isReadonly,
          ast.annotations,
          ast.defaultValue
        )
      )
    }
    case "PropertySignatureTransformation": {
      return new (S as any).PropertySignatureImpl(
        new S.PropertySignatureTransformation(
          new S.FromPropertySignature(
            exact ? ast.from.type : S.UndefinedOr(S.make(ast.from.type)).ast,
            true,
            ast.from.isReadonly,
            ast.from.annotations
          ),
          new S.ToPropertySignature(
            exact ? ast.to.type : S.UndefinedOr(S.make(ast.to.type)).ast,
            true,
            ast.to.isReadonly,
            ast.to.annotations,
            ast.to.defaultValue
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
    { decode: (...args) => Effect.sync(() => decode(...args)), encode: () => Effect.die("one way schema") }
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
) => S.transformOrFail<To, From, RD, never>(from, to, { decode, encode: () => Effect.die("one way schema") })
