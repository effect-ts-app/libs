import type { Arbitrary } from "@effect/schema/Arbitrary"
import * as fc from "fast-check"
import type { S } from "./schema.js"
import { A } from "./schema.js"

/**
 * @tsplus getter effect/schema/Arbitrary generate
 * @tsplus getter effect/schema/Arbitrary sample
 */
export function sampleFromArb<T>(arb: Arbitrary<T>) {
  return fc.sample(arb(fc), 1)[0] // TODO: whats the difference with generate?
}

// because A.to is not typed with the Arbitrary interface atm
/**
 * @tsplus getter effect/schema/Schema Arbitrary
 */
export const Arb = <From, To>(s: S.Schema<From, To>): Arbitrary<To> => A.to(s)
