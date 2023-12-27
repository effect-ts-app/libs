import type { Simplify } from "effect/Types"
import { fromBrand, nominal } from "./ext.js"
import { type B, S } from "./schema.js"

export interface PositiveIntBrand extends Simplify<B.Brand<"PositiveInt"> & NonNegativeIntBrand> {}
export const PositiveInt =
  S.Int.pipe(S.positive(), fromBrand(nominal<PositiveIntBrand>(), { jsonSchema: {} })).withDefaults
export type PositiveInt = S.Schema.To<typeof PositiveInt>

export interface NonNegativeIntBrand extends Simplify<B.Brand<"NonNegativeInt"> & IntBrand> {}
export const NonNegativeInt =
  S.Int.pipe(S.greaterThanOrEqualTo(0), fromBrand(nominal<NonNegativeIntBrand>(), { jsonSchema: {} })).withDefaults
export type NonNegativeInt = S.Schema.To<typeof NonNegativeInt>

export interface IntBrand extends Simplify<B.Brand<"Int">> {}
export const Int = S.Int.pipe(fromBrand(nominal<IntBrand>(), { jsonSchema: {} })).withDefaults
export type Int = S.Schema.To<typeof Int>
