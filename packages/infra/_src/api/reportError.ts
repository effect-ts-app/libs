import { logError, reportError } from "../errorReporter.js"
import { CauseException } from "../errors.js"

export class RequestException<E> extends CauseException<E> {
  constructor(cause: Cause<E>) {
    super(cause, "Request")
  }
}
export class FatalMainException<E> extends CauseException<E> {
  constructor(cause: Cause<E>) {
    super(cause, "FatalMain")
  }
}

const reportMainError_ = reportError((cause) => new FatalMainException(cause))

export const reportMainError = <E>(cause: Cause<E>, extras?: Record<string, unknown> | undefined) =>
  Debug.untraced(() => reportMainError_(cause, extras))

const reportRequestError_ = reportError((cause) => new RequestException(cause))

export const reportRequestError = <E>(cause: Cause<E>, extras?: Record<string, unknown> | undefined) =>
  Debug.untraced(() => reportRequestError_(cause, extras))

const logRequestError_ = logError((cause) => new RequestException(cause))

export const logRequestError = <E>(cause: Cause<E>, extras?: Record<string, unknown> | undefined) =>
  Debug.untraced(() => logRequestError_(cause, extras))

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
  return Debug.untraced(() =>
    self
      .tapErrorCause(reportRequestError)
      .fork
      .daemonChildren
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
export function forkDaemonReportRequestUnexpected<R, E, A>(self: Effect<R, E, A>) {
  return Debug.untraced(() =>
    self
      .tapErrorCause((cause) =>
        cause.isInterruptedOnly() || cause.isDie()
          ? reportRequestError(cause)
          : logRequestError(cause)
      )
      .fork
      .daemonChildren
  )
}
