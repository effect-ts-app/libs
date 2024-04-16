import { extendM } from "@effect-app/core/utils"
import * as S from "@effect/schema/Schema"
import type { Simplify } from "effect/Types"
import { fromBrand, nominal } from "./brand.js"
import { withDefaults } from "./ext.js"
import { type B } from "./schema.js"

export interface PositiveIntBrand
  extends Simplify<B.Brand<"PositiveInt"> & NonNegativeIntBrand & PositiveNumberBrand>
{}
export const PositiveInt = extendM(
  S.Int.pipe(
    S.positive(),
    fromBrand(nominal<PositiveIntBrand>(), { identifier: "PositiveInt", title: "PositiveInt", jsonSchema: {} }),
    withDefaults
  ),
  (s) => ({ withDefault: S.propertySignature(s, { default: () => s(1) }) })
)
export type PositiveInt = S.Schema.Type<typeof PositiveInt>

export interface NonNegativeIntBrand extends Simplify<B.Brand<"NonNegativeInt"> & IntBrand & NonNegativeNumberBrand> {}
export const NonNegativeInt = extendM(
  S.Int.pipe(
    S.nonNegative(),
    fromBrand(nominal<NonNegativeIntBrand>(), {
      identifier: "NonNegativeInt",
      title: "NonNegativeInt",
      jsonSchema: {}
    }),
    withDefaults
  ),
  (s) => ({ withDefault: S.propertySignature(s, { default: () => s(0) }) })
)
export type NonNegativeInt = S.Schema.Type<typeof NonNegativeInt>

export interface IntBrand extends Simplify<B.Brand<"Int">> {}
export const Int = extendM(
  S.Int.pipe(fromBrand(nominal<IntBrand>(), { identifier: "Int", title: "Int", jsonSchema: {} }), withDefaults),
  (s) => ({ withDefault: S.propertySignature(s, { default: () => s(0) }) })
)
export type Int = S.Schema.Type<typeof Int>

export interface PositiveNumberBrand extends Simplify<B.Brand<"PositiveNumber"> & NonNegativeNumberBrand> {}
export const PositiveNumber = extendM(
  S.Number.pipe(
    S.positive(),
    fromBrand(nominal<PositiveNumberBrand>(), {
      identifier: "PositiveNumber",
      title: "PositiveNumber",
      jsonSchema: {}
    }),
    withDefaults
  ),
  (s) => ({ withDefault: S.propertySignature(s, { default: () => s(1) }) })
)
export type PositiveNumber = S.Schema.Type<typeof PositiveNumber>

export interface NonNegativeNumberBrand extends Simplify<B.Brand<"NonNegativeNumber">> {}
export const NonNegativeNumber = extendM(
  S
    .Number
    .pipe(
      S.nonNegative(),
      fromBrand(nominal<NonNegativeNumberBrand>(), {
        identifier: "NonNegativeNumber",
        title: "NonNegativeNumber",
        jsonSchema: {}
      }),
      withDefaults
    ),
  (s) => ({ withDefault: S.propertySignature(s, { default: () => s(0) }) })
)
export type NonNegativeNumber = S.Schema.Type<typeof NonNegativeNumber>

/** @deprecated Not an actual decimal */
export const NonNegativeDecimal = NonNegativeNumber
/** @deprecated Not an actual decimal */
export type NonNegativeDecimal = NonNegativeNumber

/** @deprecated Not an actual decimal */
export const PositiveDecimal = PositiveNumber
/** @deprecated Not an actual decimal */
export type PositiveDecimal = PositiveNumber
