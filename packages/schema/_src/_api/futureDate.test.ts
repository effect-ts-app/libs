import { Constructor, Parser, unsafe } from "../vendor.js"
import { FutureDate } from "./futureDate.js"
import { describe, expect, test } from "vitest"

const makeFutureDateUnsafe = Constructor.for(FutureDate) >= unsafe
const parseFutureDateUnsafe = Parser.for(FutureDate) >= unsafe

describe("Constructor", () => {
  test("allows a future date", () => {
    makeFutureDateUnsafe(new Date(2040, 1, 1))
  })
  test("disallows a past date", () => {
    expect(() => makeFutureDateUnsafe(new Date(1985, 1, 1))).toThrow()
  })
})

describe("Parser", () => {
  test("allows a future date", () => {
    parseFutureDateUnsafe(new Date(2040, 1, 1).toISOString())
  })
  test("disallows a past date", () => {
    expect(() => parseFutureDateUnsafe(new Date(1985, 1, 1).toISOString()))
  })
})
