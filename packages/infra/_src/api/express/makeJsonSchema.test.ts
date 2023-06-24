import { expect } from "vitest"
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

test("works", async () => {
  expect(await (checkPaths(differentPaths)).runPromise).toStrictEqual(differentPaths)

  for (const p of equalPaths) {
    expect(await checkPaths([path, p]).runPromiseEither).toStrictEqual(
      Either.left(new InvalidStateError(`Duplicate method ${p.method} for path ${p.path}`))
    )
  }

  // it should error out
  expect(await checkPaths(["a/:p1/c/d", "a/:p111/c/d"].map((path) => ({ path, method: "get" }))).runPromiseEither)
    .toStrictEqual(
      Either.left(new InvalidStateError(`Duplicate method get for path a/:p111/c/d`))
    )

  // shadowing

  expect(await checkPaths(["a/:p1/c/:p2", "a/b"].map((path) => ({ path, method: "get" }))).runPromiseEither)
    .toStrictEqual(
      Either.right(["a/:p1/c/:p2", "a/b"].map((path) => ({ path, method: "get" })))
    )

  expect(await checkPaths([{ path: "a/:p1/c/:p2", method: "post" }, { path: "a/b", method: "get" }]).runPromiseEither)
    .toStrictEqual(
      Either.right([{ path: "a/:p1/c/:p2", method: "post" }, { path: "a/b", method: "get" }])
    )

  expect(
    await checkPaths([{ path: "a/:param/c/d", method: "get" }, { path: "a/b/c/e", method: "get" }]).runPromiseEither
  )
    .toStrictEqual(
      Either.right([{ path: "a/:param/c/d", method: "get" }, { path: "a/b/c/e", method: "get" }])
    )

  expect(await checkPaths(["a/:p", "a/b/c"].map((path) => ({ path, method: "get" }))).runPromiseEither)
    .toStrictEqual(
      Either.right(["a/:p", "a/b/c"].map((path) => ({ path, method: "get" })))
    )

  // it should error out
  // expect(await checkPaths(["a/:p", "a/b"].map((path) => ({ path, method: "get" }))).runPromiseEither)
  //   .toStrictEqual(
  //     Either.left(new InvalidStateError(`Method: GET - Path /a/b/ is shadowed by /a/:p/`))
  //   )

  // it should error out
  // expect(await checkPaths(["a/:p1/c/:p2", "a/:p111/c/d"].map((path) => ({ path, method: "get" }))).runPromiseEither)
  //   .toStrictEqual(
  //     Either.left(new InvalidStateError(`Path /a/:p111/c/d/ is shadowed by /a/:p1/c/:p2/`))
  //   )

  // it should error out
  // expect(await checkPaths(["a/:p1/c/d", "a/b/c/d"].map((path) => ({ path, method: "get" }))).runPromiseEither)
  //   .toStrictEqual(
  //     Either.left(new InvalidStateError(`Path /a/b/c/d/ is shadowed by /a/:p1/c/d/`))
  //   )

  // it should error out
  // expect(await checkPaths(["a/:p1/c/e", "a/b/:p2/d", "a/b/c/d"].map((path) => ({ path, method: "get" }))).runPromiseEither)
  //   .toStrictEqual(
  //     Either.left(new InvalidStateError(`Path /a/b/c/d/ is shadowed by /a/b/:p2/d/`))
  //   )

  // it should error out
  // expect(await checkPaths(["a/b/c", "a/:p1/e", "a/b/e"].map((path) => ({ path, method: "get" }))).runPromiseEither)
  //   .toStrictEqual(
  //     Either.left(new InvalidStateError(`Path /a/b/e/ is shadowed by /a/:p1/e/`))
  //   )

  // it should error out
  // expect(await checkPaths(["a/:p1/:p2/d", "a/b/c/d"].map((path) => ({ path, method: "get" }))).runPromiseEither)
  //   .toStrictEqual(
  //     Either.left(new InvalidStateError(`Path /a/b/c/d/ is shadowed by /a/:p1/:p2/d/`))
  //   )

  expect(
    await checkPaths([{ path: "a/:p1/c/:p2", method: "get" }, { path: "a/:p111/c/d", method: "post" }])
      .runPromiseEither
  )
    .toStrictEqual(
      Either.right([{ path: "a/:p1/c/:p2", method: "get" }, { path: "a/:p111/c/d", method: "post" }])
    )

  expect(
    await checkPaths([{ path: "a/:p1/c/d", method: "get" }, { path: "a/:p111/c/d", method: "post" }]).runPromiseEither
  )
    .toStrictEqual(
      Either.right([{ path: "a/:p1/c/d", method: "get" }, { path: "a/:p111/c/d", method: "post" }])
    )

  expect(await checkPaths(["a/:p1/c/d", "a/:p111/c/e"].map((path) => ({ path, method: "get" }))).runPromiseEither)
    .toStrictEqual(
      Either.right(["a/:p1/c/d", "a/:p111/c/e"].map((path) => ({ path, method: "get" })))
    )
})

// it should log
// test("log shadowing", async () => {
//   const arr: string[] = []
//   const paths = ["a/b", "a/:p"].map((path) => ({ path, method: "get" }))

//   const CustomLogger = Logger.make<string, void>((_, __, message) => {
//     arr.push(message)
//   })

//   await checkPaths(paths)
//     .provideLayer(Logger.replace(Logger.defaultLogger, CustomLogger))
//     .runPromise

//   expect(arr).toStrictEqual([`Path /a/:p/ is partially shadowed by /a/b/`])
// })
