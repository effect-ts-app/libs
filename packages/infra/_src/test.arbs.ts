// Do not import to frontend

import { setFaker } from "@effect-app/prelude/faker"
import type { A } from "@effect-app/prelude/schema"
import { faker } from "@faker-js/faker"
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
export function generateFromArbitrary<T>(arb: A.Arbitrary<T>) {
  return generate(arb(fc))
}
