import { RequestFiberSet, setRootParentSpan } from "@effect-app/infra-adapters/RequestFiberSet"
import { Cause, Effect } from "effect-app"
import { logError, reportError } from "../errorReporter.js"

/**
 * Forks the effect into a new fiber attached to the global scope. Because the
 * new fiber is attached to the global scope, when the fiber executing the
 * returned effect terminates, the forked fiber will continue running.
 *
 * Reports errors.
 *
 * @tsplus getter effect/io/Effect forkDaemonReportRequest
 */
export function forkDaemonReportRequest<R, E, A>(self: Effect<A, E, R>) {
  return self.pipe(
    Effect.tapErrorCause(reportError("Request")),
    setRootParentSpan,
    Effect.forkDaemon,
    Effect.tap(RequestFiberSet.add)
  )
}

/**
 * Forks the effect into a new fiber attached to the global scope. Because the
 * new fiber is attached to the global scope, when the fiber executing the
 * returned effect terminates, the forked fiber will continue running.
 *
 * Reports errors.
 *
 * @tsplus getter effect/io/Effect forkDaemonReportRequestUnexpected
 */
export function forkDaemonReportRequestUnexpected<R, E, A>(self: Effect<A, E, R>) {
  return self
    .pipe(
      Effect.tapErrorCause((cause) =>
        Cause.isInterruptedOnly(cause) || Cause.isDie(cause)
          ? reportError("request")(cause)
          : logError("request")(cause)
      ),
      setRootParentSpan,
      Effect.forkDaemon,
      Effect.tap(RequestFiberSet.add)
    )
}
