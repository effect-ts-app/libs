import { FiberId } from "@effect/core/io/FiberId"
import * as Supervisor from "@effect-ts/system/Supervisor"

export function defaultTeardown(
  status: number,
  id: FiberId,
  onExit: (status: number) => void
) {
  Fiber.interruptAllAs(FiberScope._roots, id).unsafeRunAsyncWith(() => {
    setTimeout(() => {
      if (Supervisor.mainFibers.size === 0) {
        onExit(status)
      } else {
        defaultTeardown(status, id, onExit)
      }
    }, 0)
  })
}

/**
 * A dumbed down version of effect-ts/node's runtime, in preparation of new effect-ts
 * @tsplus fluent effect/core/io/Effect runMain
 */
export function runMain<E, A>(eff: Effect<never, E, A>) {
  const onExit = (s: number) => {
    process.exit(s)
  }

  Fiber.fromEffect(eff)
    .map((context) => {
      context.await
        .map((exit) => {
          switch (exit._tag) {
            case "Failure": {
              if (exit.cause.isInterruptedOnly) {
                defaultTeardown(0, context.id, onExit)
                break
              } else {
                console.error(JSON.stringify(exit.cause, undefined, 2))
                defaultTeardown(1, context.id, onExit)
                break
              }
            }
            case "Success": {
              defaultTeardown(0, context.id, onExit)
              break
            }
          }
        })
        .unsafeRunAsync()

      function handler() {
        process.removeListener("SIGTERM", handler)
        process.removeListener("SIGINT", handler)
        context.interruptAs(context.id).unsafeRunAsync()
      }
      process.once("SIGTERM", handler)
      process.once("SIGINT", handler)
    })
    .unsafeRunAsync()
}
