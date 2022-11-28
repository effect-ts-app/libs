import { brand } from "./_schema.js"
import { PositiveNumber } from "./overrides.js"

// codegen:start {preset: barrel, include: ./api/*.ts}
export * from "./api/date.js"
// codegen:end

// TODO: true decimal
/**
 * @deprecated - implement true decimal!
 */
export const PositiveDecimal = PositiveNumber["|>"](brand<PositiveDecimal>())
/**
 * @deprecated - implement true decimal!
 */
export type PositiveDecimal = PositiveNumber & DecimalBrand

export interface DecimalBrand {
  readonly Decimal: unique symbol
}
