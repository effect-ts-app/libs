/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import * as S from "@effect/schema/Schema"

import * as B from "effect/Brand"
import type * as Brand from "effect/Brand"
import type * as Either from "effect/Either"
import type * as Option from "effect/Option"
import type { Simplify } from "effect/Types"

export type Id<A> = A
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

export type Brands2<P> = P extends B.Brand<any> ? {
    readonly [B.BrandTypeId]: Simplify<
      UnionToIntersection2<
        Test<P>
      >
    >
  }
  : never

export type Test<P extends B.Brand<any>> = {
  [K in keyof P[B.BrandTypeId]]: K extends string | symbol ? {
      readonly [k in K]: k
    }
    : never
}[keyof P[B.BrandTypeId]]
export type UnionToIntersection3<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I
  : never

export type Unbranded<P> = P extends infer Q & Brands2<P> ? Q : P

export const nominal: <A extends B.Brand<any>>() => Constructor<A> = <
  A extends B.Brand<any>
>(): Constructor<
  A
> => B.nominal<A>() as any

type GetKeys<U> = U extends Record<infer K, any> ? K : never
type UnionToIntersection2<U extends object> = {
  readonly [K in GetKeys<U>]: U extends Record<K, infer T> ? T : never
}
