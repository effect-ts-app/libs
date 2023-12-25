// Do not import to frontend

import { setFaker } from "@effect-app/prelude/faker"
import { faker } from "@faker-js/faker"

// const rnd = new Random(rand.congruential32(5))

setFaker(faker)

// /**
//  * @tsplus getter FastCheck generate
//  */
// export function generate<T>(arb: fc.Arbitrary<T>) {
//   return arb.generate(rnd, undefined)
// }

// /**
//  * @tsplus getter ets/Schema/Arbitrary/Gen generate
//  */

// export function generateFromArbitrary<T>(arb: Arbitrary.Gen<T>) {
//   return generate(arb(fc))
// }
