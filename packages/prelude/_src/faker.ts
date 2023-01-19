// FILE HAS SIDE EFFECTS!
import type Faker from "faker"
import type * as FC from "fast-check"

// TODO: inject faker differently, so we dont care about multiple instances of library.

// eslint-disable-next-line prefer-const
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let faker: typeof Faker = undefined as any as typeof Faker
export function setFaker(f: typeof Faker) {
  faker = f
}

export function getFaker() {
  if (!faker) throw new Error("You forgot to load faker library")
  return faker
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
