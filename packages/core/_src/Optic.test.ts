import { expect, test } from "vitest"

const l = Optic.id<{ test: number }>()
  .at("test")

test("fluent works", () => {
  expect(l.replace({ test: 1 }, 2))
    .toEqual({ test: 2 })
})

test("pipeable works", () => {
  expect(l.replace(2)({ test: 1 }))
    .toEqual({ test: 2 })
})
