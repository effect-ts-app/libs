import { pipe } from "@effect-ts/core/Function"
import { some } from "@effect-ts/core/Option"

import * as L from "../src/Lens/index.js"
import * as O from "../src/Optional/index.js"

interface Person {
  name: {
    first?: string
    last?: string
  }
}

describe("Lens", () => {
  it("access first", () => {
    const firstName = pipe(
      L.id<Person>(),
      L.prop("name"),
      L.asOptional,
      O.prop("first"),
      O.fromNullable
    )

    expect(
      pipe(
        <Person>{ name: { first: "Mike", last: "Arnaldi" } },
        firstName.set("Updated"),
        firstName.getOption
      )
    ).toEqual(some("Updated"))
  }),
    it("props should not set more props", () => {
      type A = { a: string; b: string }
      expect(
        pipe(
          { a: "a", b: "b" },
          pipe(
            L.id<A>(),
            L.props("a", "b"),
            L.set({ a: "1", b: "2", ...({ c: "3" } as {}) })
          )
        )
      ).toEqual({ a: "1", b: "2" })
    })
})
