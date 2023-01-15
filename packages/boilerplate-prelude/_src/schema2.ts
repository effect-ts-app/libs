import * as faker from "faker"
import type * as FC from "fast-check"
import { getFaker } from "./faker.js"

export * from "@effect-ts-app/schema2"

/**
 * Allow anonymous access
 */
export function allowAnonymous(cls: any) {
  Object.assign(cls, { allowAnonymous: true })
  return cls
}

export const fakerToArb = (fakerGen: () => ReturnType<typeof faker.fake>) =>
  (fc: typeof FC) => {
    return fc
      .integer()
      .noBias() // same probability to generate each of the allowed integers
      .noShrink() // shrink on a seed makes no sense
      .map(seed => {
        faker.seed(seed) // seed the generator
        return fakerGen() // call it
      })
  }

export const fakerArb = (
  gen: (fake: typeof faker) => () => ReturnType<typeof faker.fake>
): ((a: any) => FC.Arbitrary<string>) => fakerToArb(gen(getFaker()))

export * from "./schema2/strings.js"
