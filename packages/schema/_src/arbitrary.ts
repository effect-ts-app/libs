import type { Arbitrary } from "@effect/schema/Arbitrary"
import * as fc from "fast-check"
import type { S } from "./schema.js"
import { A } from "./schema.js"

/**
 * @tsplus fluent effect/schema/Arbitrary sample
 */
export function sampleFromArb<T>(arb: Arbitrary<T>, params?: number | fc.Parameters<T> | undefined) {
  return fc.sample(arb(fc), params)
}

// because A.to is not typed with the Arbitrary interface atm
/**
 * @tsplus getter effect/schema/Schema Arbitrary
 */
export const Arb = <R, From, To>(s: S.Schema<R, From, To>): Arbitrary<To> => A.make(s)
