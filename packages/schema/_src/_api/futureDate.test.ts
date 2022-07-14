import { describe, expect, it } from "@jest/globals"

import { Constructor, Parser, unsafe } from "../vendor.js"
import { FutureDate } from "./futureDate.js"

const makeFutureDateUnsafe = Constructor.for(FutureDate) >= unsafe
const parseFutureDateUnsafe = Parser.for(FutureDate) >= unsafe

describe("Constructor", () => {
  it("allows a future date", () => {
    makeFutureDateUnsafe(new Date(2040, 1, 1))
  })
  it("disallows a past date", () => {
    expect(() => makeFutureDateUnsafe(new Date(1985, 1, 1))).toThrow()
  })
})

describe("Parser", () => {
  it("allows a future date", () => {
    parseFutureDateUnsafe(new Date(2040, 1, 1).toISOString())
  })
  it("disallows a past date", () => {
    expect(() => parseFutureDateUnsafe(new Date(1985, 1, 1).toISOString()))
  })
})
