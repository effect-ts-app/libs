import { expect, test } from "vitest"
import type { StoreWhereFilter, Where } from "@effect-ts-app/boilerplate-infra/services/Store"
import { makeFilters } from "../../lib/filter.js"
import { codeFilter } from "./utils.js"


const somethings = [
  {a: 1, b: "b", c: ["c"], d: [{a: "a2", b: 1}, {a: "a", b: 1}], id: "1"},
  {a: 2, b: "b2", c: ["c2"], d: [{a: "a4", b: 2}, {a: "a5", b: 2}], id: "2"},
] satisfies readonly Something[]

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
  a: string,
  b: number
}

type Something = {
  a: number,
  id: string,
  b: string,
  c: readonly string[]
  d: readonly SomethingElse[]
}

test("works", () => {
  expect(somethings.toChunk.collect(codeFilter(
    somethingsWhere(_ => _("b", _ => "b2"))
  )).toArray)
  .toEqual([somethings[1]])

  expect(somethings.toChunk.collect(codeFilter(
    somethingsWhere(_ => _("b", _ => "b"))
  )).toArray)
  .toEqual([somethings[0]])


  expect(somethings.toChunk.collect(codeFilter(
    somethingsWhere(_ => _("d.-1.a", _ => "a5"))
  )).toArray)
  .toEqual([somethings[1]])

  expect(somethings.toChunk.collect(codeFilter(
    somethingsWhere(_ => _("d.-1.a", _ => "a"))
  )).toArray)
  .toEqual([somethings[0]])

  expect(somethings.toChunk.collect(codeFilter(
    somethingsWhere(_ => _("d.-1.a", _ => _.$isnt("a")))
  )).toArray)
  .toEqual([somethings[1]])
})
