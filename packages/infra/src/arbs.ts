// Do not import to frontend

import { faker } from "@faker-js/faker"
import { setFaker } from "effect-app/faker"
import type { A } from "effect-app/Schema"
import * as FastCheck from "effect/FastCheck"
import { Random } from "fast-check"
import * as rand from "pure-rand"

const rnd = new Random(rand.congruential32(5))

setFaker(faker)

export function generate<T>(arb: FastCheck.Arbitrary<T>) {
  return arb.generate(rnd, undefined)
}

export function generateFromArbitrary<T>(arb: A.LazyArbitrary<T>) {
  return generate(arb(FastCheck))
}
