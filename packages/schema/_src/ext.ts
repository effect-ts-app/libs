/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import type { Option } from "@effect-app/core/Prelude"
import { typedKeysOf } from "@effect-app/core/utils"
import type { Schema, StructFields } from "@effect/schema/Schema"
import * as S from "@effect/schema/Schema"
import { flow } from "effect"
import * as B from "effect/Brand"
import type * as Brand from "effect/Brand"
import type * as Either from "effect/Either"
import type { AST } from "./schema.js"

export const Date = Object.assign(S.Date, { withDefault: S.withDefaultConstructor(S.Date, () => new global.Date()) })
export const boolean = Object.assign(S.boolean, { withDefault: S.withDefaultConstructor(S.boolean, () => false) })
export const number = Object.assign(S.number, { withDefault: S.withDefaultConstructor(S.number, () => 0) })

export const array = flow(S.array, (s) => Object.assign(s, { withDefault: S.withDefaultConstructor(s, () => []) }))
export const readonlySet = flow(
  S.readonlySet,
  (s) => Object.assign(s, { withDefault: S.withDefaultConstructor(s, () => new Set()) })
)
export const readonlyMap = flow(
  S.readonlyMap,
  (s) => Object.assign(s, { withDefault: S.withDefaultConstructor(s, () => new Map()) })
)

/** @tsplus fluent effect/Schema/Schema nullable */
export const nullable = flow(
  S.nullable,
  (s) => Object.assign(s, { withDefault: S.withDefaultConstructor(s, () => null) })
)

export const defaultDate = <S extends Schema<any, any, Date>>(s: S) =>
  S.withDefaultConstructor(s, () => new global.Date() as any) // TODO

export const defaultBool = <S extends Schema<any, any, boolean>>(s: S) =>
  S.withDefaultConstructor(s, () => false as any) // TODO

export const defaultNullable = <S extends Schema<any, any, any>, From, To>(
  s: S & Schema<Schema.Context<S>, From, To | null>
) => S.withDefaultConstructor(s, () => null as any) // TODO

export const defaultArray = <S extends Schema<any, any, ReadonlyArray<any>>>(s: S) =>
  S.withDefaultConstructor(s, () => [] as any) // TODO

export const defaultMap = <S extends Schema<any, any, ReadonlyMap<any, any>>>(s: S) =>
  S.withDefaultConstructor(s, () => new Map() as any) // TODO

export const defaultSet = <S extends Schema<any, any, ReadonlySet<any>>>(s: S) =>
  S.withDefaultConstructor(s, () => new Set() as any) // TODO

/**
 * @tsplus getter effect/schema/Schema withDefaults
 */
export const withDefaults = <Self extends S.Schema<never, any, any>>(s: Self) => {
  const a = Object.assign(S.decodeSync(s) as WithDefaults<Self>, s)
  Object.setPrototypeOf(a, Object.getPrototypeOf(s))
  return a

  // return s as Self & WithDefaults<Self>
}

export const literal = <Literals extends ReadonlyArray<AST.LiteralValue>>(
  ...literals: Literals
) => Object.assign(S.literal(...literals) as Schema<never, Literals[number]>, { literals })

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
<R, I, A extends Unbranded<C>>(self: S.Schema<R, I, A>): S.Schema<R, I, A & C> => {
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
    Schema.Context<NER[K]>,
    Schema.From<NER[K]> | undefined,
    true,
    Schema.To<NER[K]> | undefined,
    true
  >
} {
  return typedKeysOf(t).reduce((prev, cur) => {
    prev[cur] = S.optional(t[cur] as any)
    return prev
  }, {} as any)
}

export function makeExactOptional<NER extends StructFields>(
  t: NER // TODO: enforce non empty
): {
  [K in keyof NER]: S.PropertySignature<
    Schema.Context<NER[K]>,
    Schema.From<NER[K]>,
    true,
    Schema.To<NER[K]>,
    true
  >
} {
  return typedKeysOf(t).reduce((prev, cur) => {
    prev[cur] = S.optional(t[cur] as any, { exact: true })
    return prev
  }, {} as any)
}
