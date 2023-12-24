import type { Arbitrary } from "@effect/schema/Arbitrary"
import type { ParseOptions } from "@effect/schema/AST"
import * as fc from "fast-check"
import { A, S } from "./schema.js"

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

/**
 * @tsplus fluent effect/schema/Schema __call
 */
export const parseSync = <I, A>(self: S.Schema<I, A>, u: I, options?: ParseOptions | undefined) =>
  S.parseSync(self)(u, options)
