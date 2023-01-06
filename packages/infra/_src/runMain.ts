import type { FiberId } from "@effect/io/Fiber/Id"

export function defaultTeardown(
  status: number,
  id: FiberId,
  onExit: (status: number) => void
) {
  Fiber.roots().flatMap(_ => _.interruptAllWith(id))
    .unsafeRun(() => {
      setTimeout(() => {
        if (Fiber.unsafeRoots().length === 0) {
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
              console.warn("Interrupted")
              defaultTeardown(0, context.id(), onExit)
              return
            } else {
              console.error(exit.cause.pretty())
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
