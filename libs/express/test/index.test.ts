import * as exp from "express"

import * as Express from "../src/index.js"

describe("Express", () => {
  it("should answer positively", async () => {
    interface MessageService {
      _tag: "@demo/MessageService"
      makeMessage: Effect<never, never, string>
    }

    const MessageService = Tag<MessageService>()

    const LiveMessageService = Layer.fromEffect(MessageService)(
      Effect.sync(() => ({
        _tag: "@demo/MessageService",
        makeMessage: Effect.sync(() => "ok"),
      }))
    )

    const host = "127.0.0.1"
    const port = 31157

    const exit = await Express.get("/", Express.classic(exp.json()), (_, _res) =>
      Effect.gen(function* ($) {
        const { makeMessage } = yield* $(MessageService)
        const message = yield* $(makeMessage)
        _res.send({ message })
      })
    )
      .zipRight(
        Effect.tryCatchPromise(
          fetch(`http://${host}:${port}/`).then((x): Promise<unknown> => x.json()),
          () => "error" as const
        )
      )
      .provideSomeLayer(Express.LiveExpress(host, port) + LiveMessageService)
      .unsafeRunPromise()

    expect(exit).toEqual(Exit.succeed({ message: "ok" }))
  })

  it("should log defect", async () => {
    const fakeLog = jest.fn()
    const consoleSpy = jest.spyOn(console, "error")

    consoleSpy.mockImplementation(fakeLog)

    const host = "127.0.0.1"
    const port = 31157

    await Effect.tuple(
      Express.use(
        Express.classic((req, _, next) => {
          req["message"] = "defect"
          next()
        })
      ),
      Express.get("/", (_req) =>
        Effect.sync(() => {
          throw new Error(_req["message"])
        })
      )
    )
      .zipRight(
        Effect.tryCatchPromise(
          () => fetch(`http://${host}:${port}/`),
          () => "error" as const
        )
      )
      .provideSomeLayer(Express.LiveExpress(host, port))
      .unsafeRunPromiseExit()

    consoleSpy.mockRestore()

    expect(fakeLog).toBeCalled()
    expect(fakeLog.mock.calls[0][0]).toContain("Error: defect")
    expect(fakeLog.mock.calls[0][0]).toContain("test/index.test.ts:65:24")
  })
})
