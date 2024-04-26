/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { dropUndefined } from "@effect-app/core/utils"
import * as Sentry from "@sentry/browser"
import { Cause, Effect, Predicate } from "effect-app"
import { CauseException, ErrorReported } from "effect-app/client/errors"

export function reportError(
  name: string
) {
  return (cause: Cause<unknown>, extras?: Record<string, unknown>) =>
    Effect.gen(function*($) {
      yield* $(Effect.annotateCurrentSpan({
        "exception.escaped": true,
        "exception.message": "Reported error for " + name,
        "exception.stacktrace": Cause.pretty(cause),
        "exception.type": Cause.squashWith(
          cause,
          (_) => Predicate.hasProperty(_, "_tag") ? _._tag : Predicate.hasProperty(_, "name") ? _.name : `${_}`
        ),
        "error.type": cause._tag
      }))
      if (Cause.isInterrupted(cause)) {
        yield* $(Effect.logDebug("Interrupted").pipe(Effect.annotateLogs("extras", JSON.stringify(extras ?? {}))))
        return Cause.squash(cause)
      }

      const error = new CauseException(cause, name)
      yield* $(reportSentry(error, extras))
      yield* $(
        Effect
          .logError("Reporting error", cause)
          .pipe(Effect.annotateLogs(dropUndefined({
            extras,
            __cause__: error.toJSON(),
            __error_name__: name
          })))
      )
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
    scope.setContext("error", error.toJSON() as any)
    Sentry.captureException(error, scope)
  })
}

export function logError<E>(
  name: string
) {
  return (cause: Cause<E>, extras?: Record<string, unknown>) =>
    Effect.gen(function*($) {
      if (Cause.isInterrupted(cause)) {
        yield* $(Effect.logDebug("Interrupted").pipe(Effect.annotateLogs(dropUndefined({ extras }))))
        return
      }
      const error = new CauseException(cause, name)
      yield* $(
        Effect
          .logWarning("Logging error", cause)
          .pipe(Effect.annotateLogs(dropUndefined({
            extras,
            __cause__: error.toJSON(),
            __error_name__: name
          })))
      )
    })
}

export function captureException(error: unknown) {
  Sentry.captureException(error)
  console.error(error)
}

export function reportMessage(message: string, extras?: Record<string, unknown> | undefined) {
  return Effect.sync(() => {
    const scope = new Sentry.Scope()
    if (extras) scope.setContext("extras", extras)
    Sentry.captureMessage(message, scope)

    console.warn(message)
  })
}
