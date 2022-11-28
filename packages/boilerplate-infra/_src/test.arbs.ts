// Do not import to frontend

import { setFaker } from "@effect-ts-app/boilerplate-prelude/faker"
import type { Arbitrary } from "@effect-ts-app/boilerplate-prelude/schema"
import faker from "faker"
import { Random } from "fast-check"
import * as fc from "fast-check"
import * as rand from "pure-rand"

const rnd = new Random(rand.congruential(5))

setFaker(faker)

/**
 * @tsplus getter FastCheck generate
 */
export function generate<T>(arb: fc.Arbitrary<T>) {
  return arb.generate(rnd, undefined)
}

/**
 * @tsplus getter ets/Schema/Arbitrary/Gen generate
 */

export function generateFromArbitrary<T>(arb: Arbitrary.Gen<T>) {
  return generate(arb(fc))
}
