/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import * as Sentry from "@sentry/browser"
import { Cause, Effect } from "effect-app"
import { CauseException, ErrorReported, tryToJson, tryToReport } from "effect-app/client/errors"
import { dropUndefined } from "effect-app/utils"

export function reportError(
  name: string
) {
  return (cause: Cause.Cause<unknown>, extras?: Record<string, unknown>) =>
    Effect.gen(function*() {
      if (Cause.isInterruptedOnly(cause)) {
        yield* Effect.logDebug("Interrupted").pipe(Effect.annotateLogs("extras", JSON.stringify(extras ?? {})))
        return Cause.squash(cause)
      }

      const error = new CauseException(cause, name)
      yield* reportSentry(error, extras)
      yield* Effect
        .logError("Reporting error", cause)
        .pipe(Effect.annotateLogs(dropUndefined({
          extras,
          error: tryToReport(error),
          cause: tryToJson(cause),
          __error_name__: name
        })))

      error[ErrorReported] = true
      return error
    })
}

function reportSentry(
  error: CauseException<unknown>,
  extras: Record<string, unknown> | undefined
) {
  return Effect.sync(() => {
    const scope = new Sentry.Scope()
    if (extras) scope.setContext("extras", extras)
    scope.setContext("error", tryToReport(error) as any)
    scope.setContext("cause", tryToJson(error.originalCause) as any)
    Sentry.captureException(error, scope)
  })
}

export function logError<E>(
  name: string
) {
  return (cause: Cause.Cause<E>, extras?: Record<string, unknown>) =>
    Effect.gen(function*() {
      if (Cause.isInterruptedOnly(cause)) {
        yield* Effect.logDebug("Interrupted").pipe(Effect.annotateLogs(dropUndefined({ extras })))
        return
      }
      yield* Effect
        .logWarning("Logging error", cause)
        .pipe(
          Effect.annotateLogs(dropUndefined({
            extras,
            cause: tryToJson(cause),
            __error_name__: name
          }))
        )
    })
}

export function captureException(error: unknown) {
  Sentry.captureException(error)
  console.error(error)
}

export function reportMessage(message: string, extras?: Record<string, unknown>) {
  return Effect.sync(() => {
    const scope = new Sentry.Scope()
    if (extras) scope.setContext("extras", extras)
    Sentry.captureMessage(message, scope)

    console.warn(message)
  })
}
