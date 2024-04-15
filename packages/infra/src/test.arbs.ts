// Do not import to frontend

import { faker } from "@faker-js/faker"
import { setFaker } from "effect-app/faker"
import type { A } from "effect-app/schema"
import { Random } from "fast-check"
import * as fc from "fast-check"
import * as rand from "pure-rand"

const rnd = new Random(rand.congruential32(5))

setFaker(faker)

/**
 * @tsplus getter FastCheck generateRandom
 */
export function generate<T>(arb: fc.Arbitrary<T>) {
  return arb.generate(rnd, undefined)
}

/**
 * @tsplus getter effect/schema/Arbitrary generate
 */
export function generateFromArbitrary<T>(arb: A.LazyArbitrary<T>) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  return generate(arb(fc as any))
}
