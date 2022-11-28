import type { StoreWhereFilter, Where } from "@effect-ts-app/boilerplate-infra/services/Store"
import { expect, test } from "vitest"
import { makeFilters } from "../../lib/filter.js"
import { buildWhereCosmosQuery } from "./Cosmos.js"

const f_ = makeFilters<Something>()
export type SomethingWhereFilter = typeof f_

export function makeSomethingFilter_(filter: (f: SomethingWhereFilter) => StoreWhereFilter) {
  return filter(f_)
}

export function somethingsWhere(
  makeWhere: (
    f: SomethingWhereFilter
  ) => Where | [Where, ...Where[]],
  mode?: "or" | "and"
) {
  return makeSomethingFilter_(f => {
    const m = makeWhere ? makeWhere(f) : []
    return ({
      mode,
      where: (Array.isArray(m) ? m as unknown as [Where, ...Where[]] : [m]) as readonly [Where, ...Where[]]
    })
  })
}

type SomethingElse = {
  a: string
  b: number
}

type Something = {
  a: number
  id: string
  b: string
  c: readonly string[]
  d: readonly SomethingElse[]
}

test("works", () => {
  expect(buildWhereCosmosQuery(
    somethingsWhere(_ => _("b", _ => "b2")),
    "Somethings",
    undefined,
    10
  )).toEqual({
    "parameters": [
      {
        "name": "@v0",
        "value": "b2"
      }
    ],
    "query": `
    SELECT * FROM Somethings f
    
    WHERE LOWER(f.b) = LOWER(@v0)
    OFFSET 0 LIMIT 10`
  })

  expect(buildWhereCosmosQuery(
    somethingsWhere(_ => _("d.-1.a", _ => _.$isnt("a2"))),
    "Somethings",
    undefined,
    10
  )).toEqual({
    "parameters": [
      {
        "name": "@v0",
        "value": "a2"
      }
    ],
    "query": `
    SELECT * FROM Somethings f
    JOIN d IN c.d
    WHERE LOWER(d.a) = LOWER(@v0)
    OFFSET 0 LIMIT 10`
  })
})
