import { Constructor, FutureDate, Parser, unsafe } from "../../Model"

describe("Constructor", () => {
  it("allows a future date", () => {
    Constructor.for(FutureDate)["|>"](unsafe)(new Date(2040, 1, 1))
  })
  it("disallows a past date", () => {
    expect(() =>
      Constructor.for(FutureDate)["|>"](unsafe)(new Date(1985, 1, 1))
    ).toThrow()
  })
})

describe("Parser", () => {
  it("allows a future date", () => {
    Parser.for(FutureDate)["|>"](unsafe)(new Date(2040, 1, 1).toISOString())
  })
  it("disallows a past date", () => {
    expect(() =>
      Parser.for(FutureDate)["|>"](unsafe)(new Date(1985, 1, 1).toISOString())
    )
  })
})
