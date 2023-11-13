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
export function forkDaemonReportRequest<R, E, A>(self: Effect<R, E, A>) {
  return self
    .tapErrorCause(reportError("Request"))
    .fork
    .daemonChildren
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
export function forkDaemonReportRequestUnexpected<R, E, A>(self: Effect<R, E, A>) {
  return self
    .tapErrorCause((cause) =>
      cause.isInterruptedOnly() || cause.isDie()
        ? reportError("request")(cause)
        : logError("request")(cause)
    )
    .fork
    .daemonChildren
}
