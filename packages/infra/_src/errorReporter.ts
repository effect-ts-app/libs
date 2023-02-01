import * as Sentry from "@sentry/node"
import type { CauseException } from "./errors.js"

export function reportError<E, E2 extends CauseException<unknown>>(
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
        const extras = { context, error: error.toJSON() }
        reportSentry(error, extras)
        yield* $(
          cause.logErrorCause.logAnnotate(
            "extras",
            JSON.stringify({ context, error: { _tag: error._tag, message: error.message } })
          )
        )
      })
    )
}

function reportSentry(error: unknown, extras: Record<string, unknown>) {
  const scope = new Sentry.Scope()
  scope.setExtras(extras)
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
