import { CauseException } from "../../errors.js"
import { reportError, reportErrorEffect } from "../../lib/errorReporter.js"
import { RequestContext } from "../../lib/RequestContext.js"

export class RequestException<E> extends CauseException<E> {
  constructor(cause: Cause<E>) {
    super(cause, "Request")
  }
}
export const reportRequestError = reportError(cause => new RequestException(cause))
export const reportRequestErrorEffect_ = reportErrorEffect(cause => new RequestException(cause))

export const reportRequestErrorEffect = (cause: Cause<unknown>, context?: Record<string, unknown> | undefined) =>
  RequestContext.Tag.withEffect(requestContext => reportRequestErrorEffect_(cause, { requestContext, ...context }))

/**
 * Forks the effect into a new fiber attached to the global scope. Because the
 * new fiber is attached to the global scope, when the fiber executing the
 * returned effect terminates, the forked fiber will continue running.
 *
 * Reports errors.
 *
 * @tsplus getter effect/core/io/Effect forkDaemonReportRequest
 */
export function forkDaemonReportRequest<R, E, A>(self: Effect<R, E, A>) {
  return self.tapErrorCause(reportRequestErrorEffect)
    .fork.daemonChildren
}
