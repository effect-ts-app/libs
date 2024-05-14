import { setRootParentSpan } from "@effect-app/infra-adapters/RequestFiberSet"
import { reportError } from "@effect-app/infra/errorReporter"
import { Cause, Effect, Exit } from "effect-app"
import { MainFiberSet } from "effect-app/services/MainFiberSet"

const reportQueueError_ = reportError("Queue")

export const reportQueueError = <E>(cause: Cause<E>, extras?: Record<string, unknown> | undefined) =>
  reportQueueError_(cause, extras)

/**
 * Forks the effect into a new fiber attached to the MainFiberSet scope. Because the
 * new fiber isn't attached to the parent, when the fiber executing the
 * returned effect terminates, the forked fiber will continue running.
 * The fiber will be interrupted when the MainFiberSet scope is closed.
 *
 * The parent span is set to the root span of the current fiber.
 * Reports and then swallows errors.
 *
 * @tsplus getter effect/io/Effect forkDaemonReportQueue
 */
export function forkDaemonReportQueue<A, E, R>(self: Effect<A, E, R>) {
  return self.pipe(
    Effect.asVoid,
    Effect.catchAllCause(reportNonInterruptedFailureCause({})),
    setRootParentSpan,
    MainFiberSet.run
  )
}

export const reportFatalQueueError = reportError(
  "FatalQueue"
)

export function reportNonInterruptedFailure(context?: Record<string, unknown>) {
  const report = reportNonInterruptedFailureCause(context)
  return <A, E, R>(inp: Effect<A, E, R>): Effect<Exit<A, E>, never, R> =>
    inp.pipe(
      Effect.onExit(
        Exit.match({
          onFailure: report,
          onSuccess: () => Effect.void
        })
      ),
      Effect.exit
    )
}

export function reportNonInterruptedFailureCause(context?: Record<string, unknown>) {
  return <E>(cause: Cause<E>): Effect<void> => {
    if (Cause.isInterrupted(cause)) {
      return Effect.failCause(cause as Cause<never>)
    }
    return reportQueueError(cause, context)
  }
}
