import { RequestFiberSet, setRootParentSpan } from "@effect-app/infra-adapters/RequestFiberSet"
import { Cause, Effect } from "effect-app"
import { logError, reportError } from "../errorReporter.js"

// const onExitReportError = (name: string, unknownOnly?: boolean) => {
//   const report = reportError(name)
//   const log = logError(name)
//   return <A, E, R>(self: Effect<A, E, R>) =>
//     Effect.onExit(self, (exit) =>
//       Exit.isFailure(exit)
//         ? unknownOnly
//           ? Cause.isInterruptedOnly(exit.cause) || Cause.isDie(exit.cause)
//             ? report(exit.cause)
//             : log(exit.cause)
//           : report(exit.cause)
//         : Effect.void)
// }
const tapErrorCause = (name: string, unknownOnly?: boolean) => {
  const report = reportError(name)
  const log = logError(name)
  return <A, E, R>(self: Effect<A, E, R>) =>
    Effect.tapErrorCause(self, (cause) =>
      unknownOnly
        ? Cause.isFailure(cause)
          ? log(cause)
          : report(cause)
        : report(cause))
}
const reportRequestError = tapErrorCause("request")
const reportUnknownRequestError = tapErrorCause("request", true)

/**
 * Forks the effect into a new fiber attached to the RequestFiberSet scope. Because the
 * new fiber isn't attached to the parent, when the fiber executing the
 * returned effect terminates, the forked fiber will continue running.
 * The fiber will be interrupted when the RequestFiberSet scope is closed.
 *
 * The parent span is set to the root span of the current fiber.
 * Reports errors.
 */
export function forkDaemonReportRequest<R, E, A>(self: Effect<A, E, R>) {
  return self.pipe(
    reportRequestError,
    setRootParentSpan,
    Effect.uninterruptible,
    RequestFiberSet.run
  )
}

/**
 * Forks the effect into a new fiber attached to the RequestFiberSet scope. Because the
 * new fiber isn't attached to the parent, when the fiber executing the
 * returned effect terminates, the forked fiber will continue running.
 * The fiber will be interrupted when the RequestFiberSet scope is closed.
 *
 * The parent span is set to the root span of the current fiber.
 * Reports unexpected errors.
 */
export function forkDaemonReportRequestUnexpected<R, E, A>(self: Effect<A, E, R>) {
  return self
    .pipe(
      reportUnknownRequestError,
      setRootParentSpan,
      Effect.uninterruptible,
      RequestFiberSet.run
    )
}
