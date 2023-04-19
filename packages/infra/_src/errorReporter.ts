import * as Sentry from "@sentry/node"
import type { CauseException } from "./errors.js"
import type { RequestContext } from "./RequestContext.js"
import { RequestContextContainer } from "./services/RequestContextContainer.js"

export function reportError<E, E2 extends CauseException<unknown>>(
  makeError: (cause: Cause<E>) => E2
) {
  return (cause: Cause<E>, extras?: Record<string, unknown>) =>
    Debug.untraced(() =>
      Effect.gen(function*($) {
        const context = yield* $(RequestContextContainer.getOption)
        if (cause.isInterrupted()) {
          const data = { context, ...extras }
          yield* $(Effect.logDebug("Interrupted: " + (data ? data.$$.pretty : "")))
          return
        }
        const error = makeError(cause)
        reportSentry(error, context.value, extras)
        yield* $(
          cause.logErrorCause.logAnnotate(
            "extras",
            JSON.stringify({ context, extras, error: { _tag: error._tag, message: error.message } })
          )
        )
      })
    )
}

function reportSentry<E2 extends CauseException<unknown>>(
  error: E2,
  context: RequestContext | undefined,
  extras: Record<string, unknown> | undefined
) {
  const scope = new Sentry.Scope()
  if (context) scope.setContext("context", context as unknown as Record<string, unknown>)
  if (extras) scope.setContext("extras", extras)
  scope.setContext("error", error.toJSON())
  Sentry.captureException(error, scope)
}

export function logError<E, E2 extends CauseException<unknown>>(
  makeError: (cause: Cause<E>) => E2
) {
  return (cause: Cause<E>, context?: Record<string, unknown>) =>
    Debug.untraced(() =>
      Effect.gen(function*($) {
        if (cause.isInterrupted()) {
          yield* $(Effect.logDebug("Interrupted: " + (context ? context.$$.pretty : "")))
          return
        }
        const error = makeError(cause)
        yield* $(
          cause.logWarningCause.logAnnotate(
            "extras",
            JSON.stringify({ context, error: { _tag: error._tag, message: error.message } })
          )
        )
      })
    )
}

export function captureException(error: unknown) {
  Sentry.captureException(error)
  console.error(error)
}

export function reportMessage(message: string) {
  Sentry.captureMessage(message)

  console.warn(message)
}

export function reportMessageM(message: string) {
  return Effect(reportMessage(message))
}
