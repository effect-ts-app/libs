import * as T from "@effect-ts/core/Effect"
import * as Exit from "@effect-ts/core/Effect/Exit"
import * as L from "@effect-ts/core/Effect/Layer"
import { pipe } from "@effect-ts/core/Function"
import { tag } from "@effect-ts/core/Has"
import * as exp from "express"

import * as Express from "../src/index.js"

describe("Express", () => {
  it("should answer positively", async () => {
    interface MessageService {
      _tag: "@demo/MessageService"
      makeMessage: T.UIO<string>
    }

    const MessageService = tag<MessageService>()

    const LiveMessageService = L.fromEffect(MessageService)(
      T.succeedWith(() => ({
        _tag: "@demo/MessageService",
        makeMessage: T.succeedWith(() => "ok")
      }))
    )

    const host = "127.0.0.1"
    const port = 31157

    const exit = await pipe(
      Express.get("/", Express.classic(exp.json()), (_, _res) =>
        T.gen(function* ($) {
          const { makeMessage } = yield* $(MessageService)
          const message = yield* $(makeMessage)
          _res.send({ message })
        })
      ),
      T.zipRight(
        T.tryPromise(() => fetch(`http://${host}:${port}/`).then((x) => x.json()))
      ),
      T.provideSomeLayer(Express.LiveExpress(host, port)["+++"](LiveMessageService)),
      T.runPromiseExit
    )

    expect(exit).toEqual(Exit.succeed({ message: "ok" }))
  })

  it("should log defect", async () => {
    const fakeLog = jest.fn()
    const consoleSpy = jest.spyOn(console, "error")

    consoleSpy.mockImplementation(fakeLog)

    const host = "127.0.0.1"
    const port = 31157

    await pipe(
      T.tuple(
        Express.use(
          Express.classic((req, _, next) => {
            req["message"] = "defect"
            next()
          })
        ),
        Express.get("/", (_req) =>
          T.succeedWith(() => {
            throw new Error(_req["message"])
          })
        )
      ),
      T.zipRight(T.tryPromise(() => fetch(`http://${host}:${port}/`))),
      T.provideSomeLayer(Express.LiveExpress(host, port)),
      T.runPromiseExit
    )

    consoleSpy.mockRestore()

    expect(fakeLog).toBeCalled()
    expect(fakeLog.mock.calls[0][0]).toContain("Error: defect")
    expect(fakeLog.mock.calls[0][0]).toContain("test/index.test.ts:65:24")
  })
})
