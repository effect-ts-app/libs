import { InvalidStateError } from "../../errors.js"
import { checkDuplicatePaths } from "./makeJsonSchema.js"

const path = { path: "/securities/:id/search/:id2", method: "get" }

const equalPaths = [
  "/securities/:idt/search/:id2",
  "/securities/:id/search/:id2t",
  "/securities/:idt/search/:id2t"
]
  .map((path) => ({ path, method: "get" }))

const differentPaths: {
  path: string
  method: string
}[] = [
  "/securities/:id/search/",
  "/securities/search/:id2",
  "/securities/:id/:id2/search/:id3"
]
  .map((path) => ({ path, method: "get" }))
  .concat([
    "/securities/:idt/search/:id2"
  ]
    .map((path) => ({ path, method: "post" })))

test("works", () => {
  expect(checkDuplicatePaths([path, ...differentPaths])).toStrictEqual(Effect.succeed([path, ...differentPaths]))

  equalPaths.forEach((p) =>
    expect(checkDuplicatePaths([path, p])).toStrictEqual(
      Effect.fail(new InvalidStateError(`Duplicate method ${p.method} for path ${p.path}`))
    )
  )
})
