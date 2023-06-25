import { expect } from "vitest"
import { InvalidStateError } from "../../errors.js"
import { checkPaths, normalizePath } from "./makeJsonSchema.js"

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

  // duplication

  for (const p of equalPaths) {
    expect(await checkPaths([path, p]).runPromiseEither).toStrictEqual(
      Either.left(
        new InvalidStateError(
          `Method: GET - Path ${normalizePath(p.path)} is a duplicate of ${normalizePath(path.path)}`
        )
      )
    )
  }

  expect(await checkPaths(["a/:p1/c/d", "a/:p111/c/d"].map((path) => ({ path, method: "get" }))).runPromiseEither)
    .toStrictEqual(
      Either.left(new InvalidStateError(`Method: GET - Path /a/:p111/c/d/ is a duplicate of /a/:p1/c/d/`))
    )

  expect(await checkPaths(["a/:p1", "a/:p111"].map((path) => ({ path, method: "get" }))).runPromiseEither)
    .toStrictEqual(
      Either.left(new InvalidStateError(`Method: GET - Path /a/:p111/ is a duplicate of /a/:p1/`))
    )

  expect(await checkPaths(["a/:p1/c", "a/:p111/c"].map((path) => ({ path, method: "get" }))).runPromiseEither)
    .toStrictEqual(
      Either.left(new InvalidStateError(`Method: GET - Path /a/:p111/c/ is a duplicate of /a/:p1/c/`))
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

  expect(await checkPaths(["a/:p", "a/b"].map((path) => ({ path, method: "get" }))).runPromiseEither)
    .toStrictEqual(
      Either.left(new InvalidStateError(`Method: GET - Path /a/b/ is shadowed by /a/:p/`))
    )

  expect(await checkPaths(["a/:p1/c/:p2", "a/:p111/c/d"].map((path) => ({ path, method: "get" }))).runPromiseEither)
    .toStrictEqual(
      Either.left(new InvalidStateError(`Method: GET - Path /a/:p111/c/d/ is shadowed by /a/:p1/c/:p2/`))
    )

  expect(await checkPaths(["a/:p1/:p2", "a/:p111/c"].map((path) => ({ path, method: "get" }))).runPromiseEither)
    .toStrictEqual(
      Either.left(new InvalidStateError(`Method: GET - Path /a/:p111/c/ is shadowed by /a/:p1/:p2/`))
    )

  expect(await checkPaths(["a/:p1/d", "a/:p111/c"].map((path) => ({ path, method: "get" }))).runPromiseEither)
    .toStrictEqual(
      Either.right(["a/:p1/d", "a/:p111/c"].map((path) => ({ path, method: "get" })))
    )

  expect(await checkPaths(["a/:p1/c/d", "a/b/c/d"].map((path) => ({ path, method: "get" }))).runPromiseEither)
    .toStrictEqual(
      Either.left(new InvalidStateError(`Method: GET - Path /a/b/c/d/ is shadowed by /a/:p1/c/d/`))
    )

  expect(
    await checkPaths(["a/:p1/c/e", "a/b/:p2/d", "a/b/c/d"].map((path) => ({ path, method: "get" }))).runPromiseEither
  )
    .toStrictEqual(
      Either.left(new InvalidStateError(`Method: GET - Path /a/b/c/d/ is shadowed by /a/b/:p2/d/`))
    )

  expect(
    await checkPaths(["a/b/:p2/e", "a/:p1/c/d", "a/b/c/d"].map((path) => ({ path, method: "get" }))).runPromiseEither
  )
    .toStrictEqual(
      Either.left(new InvalidStateError(`Method: GET - Path /a/b/c/d/ is shadowed by /a/:p1/c/d/`))
    )

  expect(
    await checkPaths(["a/b/:p2/e", "a/b/:p1/d", "a/b/c/d"].map((path) => ({ path, method: "get" }))).runPromiseEither
  )
    .toStrictEqual(
      Either.left(new InvalidStateError(`Method: GET - Path /a/b/c/d/ is shadowed by /a/b/:p2/d/`))
    )

  expect(await checkPaths(["a/b/c", "a/:p1/e", "a/b/e"].map((path) => ({ path, method: "get" }))).runPromiseEither)
    .toStrictEqual(
      Either.left(new InvalidStateError(`Method: GET - Path /a/b/e/ is shadowed by /a/:p1/e/`))
    )

  expect(await checkPaths(["a/:p1/:p2/d", "a/b/c/d"].map((path) => ({ path, method: "get" }))).runPromiseEither)
    .toStrictEqual(
      Either.left(new InvalidStateError(`Method: GET - Path /a/b/c/d/ is shadowed by /a/:p1/:p2/d/`))
    )

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

test("log shadowing 1", async () => {
  const arr: string[] = []
  const paths = ["b", ":p"].map((path) => ({ path, method: "get" }))

  const CustomLogger = Logger.make<string, void>((_, __, message) => {
    arr.push(message)
  })

  await checkPaths(paths)
    .provideLayer(Logger.replace(Logger.defaultLogger, CustomLogger))
    .runPromise

  expect(arr).toStrictEqual([`Method: GET - Path /:p/ is partially shadowed by /b/`])
})

test("log shadowing 2", async () => {
  const arr: string[] = []
  const paths = ["pa/b", "pa/:p"].map((path) => ({ path, method: "get" }))

  const CustomLogger = Logger.make<string, void>((_, __, message) => {
    arr.push(message)
  })

  await checkPaths(paths)
    .provideLayer(Logger.replace(Logger.defaultLogger, CustomLogger))
    .runPromise

  expect(arr).toStrictEqual([`Method: GET - Path /pa/:p/ is partially shadowed by /pa/b/`])
})

test("log shadowing 3", async () => {
  const arr: string[] = []
  const paths = ["/b/:p/c/", "/:e/x/c/"].map((path) => ({ path, method: "get" }))

  const CustomLogger = Logger.make<string, void>((_, __, message) => {
    arr.push(message)
  })

  await checkPaths(paths)
    .provideLayer(Logger.replace(Logger.defaultLogger, CustomLogger))
    .runPromise

  expect(arr).toStrictEqual([`Method: GET - Path /:e/x/c/ is partially shadowed by /b/:p/c/`])
})

test("log shadowing 4", async () => {
  const arr: string[] = []
  const paths = ["b/x/c", ":e/:p/c"].map((path) => ({ path, method: "get" }))

  const CustomLogger = Logger.make<string, void>((_, __, message) => {
    arr.push(message)
  })

  await checkPaths(paths)
    .provideLayer(Logger.replace(Logger.defaultLogger, CustomLogger))
    .runPromise

  expect(arr).toStrictEqual([`Method: GET - Path /:e/:p/c/ is partially shadowed by /b/x/c/`])
})

test("log shadowing 5", async () => {
  const arr: string[] = []
  const paths = ["b/x/c/:d", ":e/:p/c/z"].map((path) => ({ path, method: "get" }))

  const CustomLogger = Logger.make<string, void>((_, __, message) => {
    arr.push(message)
  })

  await checkPaths(paths)
    .provideLayer(Logger.replace(Logger.defaultLogger, CustomLogger))
    .runPromise

  expect(arr).toStrictEqual([`Method: GET - Path /:e/:p/c/z/ is partially shadowed by /b/x/c/:d/`])
})

test("log shadowing 6", async () => {
  const arr: string[] = []
  const paths = ["b/x/c/z", ":e/:p/c/:d"].map((path) => ({ path, method: "get" }))

  const CustomLogger = Logger.make<string, void>((_, __, message) => {
    arr.push(message)
  })

  await checkPaths(paths)
    .provideLayer(Logger.replace(Logger.defaultLogger, CustomLogger))
    .runPromise

  expect(arr).toStrictEqual([`Method: GET - Path /:e/:p/c/:d/ is partially shadowed by /b/x/c/z/`])
})

test("log shadowing 7", async () => {
  const arr: string[] = []
  const paths = ["b/:p/c", ":e/:q/c"].map((path) => ({ path, method: "get" }))

  const CustomLogger = Logger.make<string, void>((_, __, message) => {
    arr.push(message)
  })

  await checkPaths(paths)
    .provideLayer(Logger.replace(Logger.defaultLogger, CustomLogger))
    .runPromise

  expect(arr).toStrictEqual([`Method: GET - Path /:e/:q/c/ is partially shadowed by /b/:p/c/`])
})

test("log shadowing 8", async () => {
  const arr: string[] = []
  const paths = ["b/:p/z/c", ":e/:q/:dd/c"].map((path) => ({ path, method: "get" }))

  const CustomLogger = Logger.make<string, void>((_, __, message) => {
    arr.push(message)
  })

  await checkPaths(paths)
    .provideLayer(Logger.replace(Logger.defaultLogger, CustomLogger))
    .runPromise

  expect(arr).toStrictEqual([`Method: GET - Path /:e/:q/:dd/c/ is partially shadowed by /b/:p/z/c/`])
})

test("log shadowing 9", async () => {
  const arr: string[] = []
  const paths = ["b/:p/c", ":e/:q/:e"].map((path) => ({ path, method: "get" }))

  const CustomLogger = Logger.make<string, void>((_, __, message) => {
    arr.push(message)
  })

  await checkPaths(paths)
    .provideLayer(Logger.replace(Logger.defaultLogger, CustomLogger))
    .runPromise

  expect(arr).toStrictEqual([`Method: GET - Path /:e/:q/:e/ is partially shadowed by /b/:p/c/`])
})

test("log shadowing 10", async () => {
  const arr: string[] = []
  const paths = ["a/b/c", ":p/e/c"].map((path) => ({
    path,
    method: "get"
  }))

  const CustomLogger = Logger.make<string, void>((_, __, message) => {
    arr.push(message)
  })

  await checkPaths(paths)
    .provideLayer(Logger.replace(Logger.defaultLogger, CustomLogger))
    .runPromise

  expect(arr).toStrictEqual([])
})

test("log shadowing 11", async () => {
  const arr: string[] = []
  const paths = ["a/b/c", ":p/:p/c"].map((path) => ({
    path,
    method: "get"
  }))

  const CustomLogger = Logger.make<string, void>((_, __, message) => {
    arr.push(message)
  })

  await checkPaths(paths)
    .provideLayer(Logger.replace(Logger.defaultLogger, CustomLogger))
    .runPromise

  expect(arr).toStrictEqual(["Method: GET - Path /:p/:p/c/ is partially shadowed by /a/b/c/"])
})

test("log shadowing 12", async () => {
  const arr: string[] = []
  const paths = ["a/b/:c", ":p/:p/c"].map((path) => ({
    path,
    method: "get"
  }))

  const CustomLogger = Logger.make<string, void>((_, __, message) => {
    arr.push(message)
  })

  await checkPaths(paths)
    .provideLayer(Logger.replace(Logger.defaultLogger, CustomLogger))
    .runPromise

  expect(arr).toStrictEqual(["Method: GET - Path /:p/:p/c/ is partially shadowed by /a/b/:c/"])
})
