import { extendM } from "@effect-app/core/utils"
import type { Simplify } from "effect/Types"
import { fromBrand, nominal } from "./ext.js"
import { type B, S } from "./schema.js"

export interface PositiveIntBrand
  extends Simplify<B.Brand<"PositiveInt"> & NonNegativeIntBrand & PositiveNumberBrand>
{}
export const PositiveInt = extendM(
  S.Int.pipe(S.positive(), fromBrand(nominal<PositiveIntBrand>(), { jsonSchema: {} })).withDefaults,
  (s) => ({ withDefault: () => s.withDefaultMake(() => s(1)) })
)
export type PositiveInt = S.Schema.To<typeof PositiveInt>

export interface NonNegativeIntBrand extends Simplify<B.Brand<"NonNegativeInt"> & IntBrand & NonNegativeNumberBrand> {}
export const NonNegativeInt = extendM(
  S.Int.pipe(S.nonNegative(), fromBrand(nominal<NonNegativeIntBrand>(), { jsonSchema: {} })).withDefaults,
  (s) => ({ withDefault: () => s.withDefaultMake(() => s(0)) })
)
export type NonNegativeInt = S.Schema.To<typeof NonNegativeInt>

export interface IntBrand extends Simplify<B.Brand<"Int">> {}
export const Int = extendM(
  S.Int.pipe(fromBrand(nominal<IntBrand>(), { jsonSchema: {} })).withDefaults,
  (s) => ({ withDefault: () => s.withDefaultMake(() => s(0)) })
)
export type Int = S.Schema.To<typeof Int>

export interface PositiveNumberBrand extends Simplify<B.Brand<"PositiveNumber"> & NonNegativeNumberBrand> {}
export const PositiveNumber = extendM(
  S.number.pipe(S.positive(), fromBrand(nominal<PositiveNumberBrand>(), { jsonSchema: {} })).withDefaults,
  (s) => ({ withDefault: () => s.withDefaultMake(() => s(1)) })
)
export type PositiveNumber = S.Schema.To<typeof PositiveNumber>

export interface NonNegativeNumberBrand extends Simplify<B.Brand<"NonNegativeNumber">> {}
export const NonNegativeNumber = extendM(
  S
    .number
    .pipe(S.nonNegative(), fromBrand(nominal<NonNegativeNumberBrand>(), { jsonSchema: {} }))
    .withDefaults,
  (s) => ({ withDefault: () => s.withDefaultMake(() => s(0)) })
)
export type NonNegativeNumber = S.Schema.To<typeof NonNegativeNumber>

/** @deprecated Not an actual decimal */
export const NonNegativeDecimal = NonNegativeNumber
/** @deprecated Not an actual decimal */
export type NonNegativeDecimal = NonNegativeNumber

/** @deprecated Not an actual decimal */
export const PositiveDecimal = PositiveNumber
/** @deprecated Not an actual decimal */
export type PositiveDecimal = PositiveNumber
