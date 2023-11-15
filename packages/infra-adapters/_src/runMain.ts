import type { FiberId } from "effect/FiberId"

export function defaultTeardown(
  status: number,
  id: FiberId,
  onExit: (status: number) => void
) {
  Fiber
    .roots
    .flatMap((_) => _.interruptAllAs(id))
    .runCallback(() => {
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

  Fiber
    .fromEffect(eff)
    .map((context) => {
      context
        .await
        .flatMap((exit) =>
          Effect.gen(function*($) {
            if (exit.isFailure()) {
              if (exit.cause.isInterruptedOnly()) {
                yield* $(Effect.logWarning("Main process Interrupted"))
                defaultTeardown(0, context.id(), onExit)
                return
              } else {
                yield* $(Effect.logError("Main process Error", exit.cause))
                defaultTeardown(1, context.id(), onExit)
                return
              }
            } else {
              defaultTeardown(0, context.id(), onExit)
            }
          })
        )
        .runCallback()

      function handler() {
        process.removeListener("SIGTERM", handler)
        process.removeListener("SIGINT", handler)
        context.interruptAsFork(context.id()).runCallback()
      }
      process.once("SIGTERM", handler)
      process.once("SIGINT", handler)
    })
    .runCallback()
}
