import type { FiberId } from "@effect/io/Fiber/Id"
import { inspect } from "util"

export function defaultTeardown(
  status: number,
  id: FiberId,
  onExit: (status: number) => void
) {
  Fiber.roots().flatMap(_ => _.interruptAllWith(id))
    .unsafeRun(() => {
      setTimeout(() => {
        if (Fiber.roots().unsafeRunSync.length === 0) {
          onExit(status)
        } else {
          defaultTeardown(status, id, onExit)
        }
      }, 0)
    })
}

/**
 * A dumbed down version of effect-ts/node's runtime, in preparation of new effect-ts
 * @tsplus fluent effect/io/Effect runMain
 */
export function runMain<E, A>(eff: Effect<never, E, A>) {
  const onExit = (s: number) => {
    process.exit(s)
  }

  Fiber.fromEffect(eff)
    .map(context => {
      context.await()
        .map(exit => {
          if (exit.isFailure()) {
            if (exit.cause.isInterruptedOnly) {
              defaultTeardown(0, context.id(), onExit)
              return
            } else {
              console.error(inspect(exit.cause, true, 25))
              defaultTeardown(1, context.id(), onExit)
              return
            }
          } else {
            defaultTeardown(0, context.id(), onExit)
          }
        })
        .unsafeRun()

      function handler() {
        process.removeListener("SIGTERM", handler)
        process.removeListener("SIGINT", handler)
        context.interruptWith(context.id()).unsafeRun()
      }
      process.once("SIGTERM", handler)
      process.once("SIGINT", handler)
    })
    .unsafeRun()
}
