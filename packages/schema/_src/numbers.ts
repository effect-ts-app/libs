import type { Simplify } from "effect/Types"
import { fromBrand, nominal } from "./ext.js"
import { type B, S } from "./schema.js"

export interface PositiveIntBrand
  extends Simplify<B.Brand<"PositiveInt"> & NonNegativeIntBrand & PositiveNumberBrand>
{}
export const PositiveInt =
  S.Int.pipe(S.positive(), fromBrand(nominal<PositiveIntBrand>(), { jsonSchema: {} })).withDefaults
export type PositiveInt = S.Schema.To<typeof PositiveInt>

export interface NonNegativeIntBrand extends Simplify<B.Brand<"NonNegativeInt"> & IntBrand & NonNegativeNumberBrand> {}
export const NonNegativeInt =
  S.Int.pipe(S.nonNegative(), fromBrand(nominal<NonNegativeIntBrand>(), { jsonSchema: {} })).withDefaults
export type NonNegativeInt = S.Schema.To<typeof NonNegativeInt>

export interface IntBrand extends Simplify<B.Brand<"Int">> {}
export const Int = S.Int.pipe(fromBrand(nominal<IntBrand>(), { jsonSchema: {} })).withDefaults
export type Int = S.Schema.To<typeof Int>

export interface PositiveNumberBrand extends Simplify<B.Brand<"PositiveNumber"> & NonNegativeNumberBrand> {}
export const PositiveNumber =
  S.number.pipe(S.positive(), fromBrand(nominal<PositiveNumberBrand>(), { jsonSchema: {} })).withDefaults
export type PositiveNumber = S.Schema.To<typeof PositiveNumber>

export interface NonNegativeNumberBrand extends Simplify<B.Brand<"NonNegativeNumber">> {}
export const NonNegativeNumber = S
  .number
  .pipe(S.nonNegative(), fromBrand(nominal<NonNegativeNumberBrand>(), { jsonSchema: {} }))
  .withDefaults
export type NonNegativeNumber = S.Schema.To<typeof NonNegativeNumber>

/** @deprecated Not an actual decimal */
export const NonNegativeDecimal = NonNegativeNumber
/** @deprecated Not an actual decimal */
export type NonNegativeDecimal = NonNegativeNumber

/** @deprecated Not an actual decimal */
export const PositiveDecimal = PositiveNumber
/** @deprecated Not an actual decimal */
export type PositiveDecimal = PositiveNumber
