import { InvalidStateError } from "../../errors.js"
import { checkPaths } from "./makeJsonSchema.js"

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
  "/securities/search/:id2",
  "/securities/:id/search/",
  "/securities/:id/search/:id2",
  "/securities/:id/:id2/search/:id3"
]
  .map((path) => ({ path, method: "get" }))
  .concat([
    "/securities/:idt/search/:id2"
  ]
    .map((path) => ({ path, method: "post" })))

test("works", () => {
  expect(checkPaths(differentPaths)).toStrictEqual(Effect.succeed(differentPaths))

  equalPaths.forEach((p) =>
    expect(checkPaths([path, p])).toStrictEqual(
      Effect.fail(new InvalidStateError(`Duplicate method ${p.method} for path ${p.path}`))
    )
  )

  expect(checkPaths(["a/:p1/c/:p2", "a/b"].map((path) => ({ path, method: "get" })))).toStrictEqual(
    Effect.fail(new InvalidStateError(`Path /a/b/ is shadowed by /a/:p1/`))
  )

  expect(checkPaths(["a/:p1/c/:p2", "a/:p111/c/d"].map((path) => ({ path, method: "get" })))).toStrictEqual(
    Effect.fail(new InvalidStateError(`Path /a/:p1/c/d/ is shadowed by /a/:p1/c/:p2/`))
  )
})
