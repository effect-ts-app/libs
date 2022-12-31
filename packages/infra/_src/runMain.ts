import * as Supervisor from "@effect-ts/system/Supervisor"
import type { FiberId } from "@effect/io/Fiber/Id"
import { inspect } from "util"

export function defaultTeardown(
  status: number,
  id: FiberId,
  onExit: (status: number) => void
) {
  void Fiber.roots().flatMap(_ => _.interruptAllWith(id))
    .unsafeRunPromiseExit.then(() => {
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
 * @tsplus fluent effect/io/Effect runMain
 */
export function runMain<E, A>(eff: Effect<never, E, A>) {
  const onExit = (s: number) => {
    process.exit(s)
  }

  void Fiber.fromEffect(eff)
    .map(context => {
      void context.await()
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
        .unsafeRunPromise

      function handler() {
        process.removeListener("SIGTERM", handler)
        process.removeListener("SIGINT", handler)
        void context.interruptWith(context.id()).unsafeRunPromise
      }
      process.once("SIGTERM", handler)
      process.once("SIGINT", handler)
    })
    .unsafeRunPromise
}
