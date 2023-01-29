import { reportError } from "@effect-app/infra/errorReporter"
import { CauseException } from "@effect-app/infra/errors"
import { RequestContext } from "@effect-app/infra/RequestContext"

export class MessageException<E> extends CauseException<E> {
  constructor(cause: Cause<E>) {
    super(cause, "Message")
  }
}

export class FatalQueueException<E> extends CauseException<E> {
  constructor(cause: Cause<E>) {
    super(cause, "Message")
  }
}

const reportQueueError_ = reportError(cause => new MessageException(cause))

export const reportQueueError = (cause: Cause<unknown>, context?: Record<string, unknown> | undefined) =>
  RequestContext.Tag.accessWithEffect(requestContext =>
    Effect(reportQueueError_(cause, { requestContext, ...context }))
  )

/**
 * Forks the effect into a new fiber attached to the global scope. Because the
 * new fiber is attached to the global scope, when the fiber executing the
 * returned effect terminates, the forked fiber will continue running.
 *
 * Reports errors.
 *
 * @tsplus getter effect/io/Effect forkDaemonReportQueue
 */
export function forkDaemonReportQueue<R, E, A>(self: Effect<R, E, A>) {
  return self.tapErrorCause(reportQueueError).fork.daemonChildren
}

export const reportFatalQueueError = reportError(
  cause => new FatalQueueException(cause)
)

export function reportFailure(name: string) {
  return <R, E, A>(self: Effect<R, E, A>) =>
    self.exit.tap(exit =>
      exit._tag === "Failure"
        ? reportFatalQueueError(exit.cause, { name })
        : Effect.unit
    )
}
