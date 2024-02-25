import { reportError } from "@effect-app/infra/errorReporter"
import { Cause, Exit } from "effect-app"
import { Effect } from "effect-app"

const reportQueueError_ = reportError("Queue")

export const reportQueueError = <E>(cause: Cause<E>, extras?: Record<string, unknown> | undefined) =>
  reportQueueError_(cause, extras)

/**
 * Forks the effect into a new fiber attached to the global scope. Because the
 * new fiber is attached to the global scope, when the fiber executing the
 * returned effect terminates, the forked fiber will continue running.
 *
 * Reports errors.
 *
 * @tsplus getter effect/io/Effect forkDaemonReportQueue
 */
export function forkDaemonReportQueue<R, E, A>(self: Effect<A, E, R>) {
  return self.pipe(Effect.tapErrorCause(reportNonInterruptedFailureCause({})), Effect.fork, Effect.daemonChildren)
}

export const reportFatalQueueError = reportError(
  "FatalQueue"
)

export function reportNonInterruptedFailure(context?: Record<string, unknown>) {
  const report = reportNonInterruptedFailureCause(context)
  return <R, E, A>(inp: Effect<A, E, R>): Effect<Exit<A, E>, never, R> =>
    inp.pipe(
      Effect
        .exit,
      Effect
        .flatMap((result) =>
          Exit.match(result, {
            onFailure: (cause) => Effect.map(report(cause), () => result),
            onSuccess: () => Effect.sync(() => result)
          })
        )
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
