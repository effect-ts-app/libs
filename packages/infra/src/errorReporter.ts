import { dropUndefined } from "@effect-app/core/utils"
import * as Sentry from "@sentry/node"
import { Cause, Effect, Option } from "effect-app"
import { CauseException } from "./errors.js"
import { RequestContextContainer } from "./services/RequestContextContainer.js"

export function reportError(
  name: string
) {
  return (cause: Cause<unknown>, extras?: Record<string, unknown>) =>
    Effect.gen(function*($) {
      if (Cause.isInterrupted(cause)) {
        yield* $(Effect.logDebug("Interrupted").pipe(Effect.annotateLogs("extras", JSON.stringify(extras ?? {}))))
        return
      }
      yield* $(reportSentry(cause, name, extras))
      const error = new CauseException(cause, name)
      yield* $(
        Effect
          .logError("Reporting error", cause)
          .pipe(Effect.annotateLogs(dropUndefined({
            extras,
            __cause__: error.toJSON(),
            __error_name__: name
          })))
      )
    })
}

function reportSentry(
  cause: Cause<unknown>,
  name: string,
  extras: Record<string, unknown> | undefined
) {
  return RequestContextContainer.getOption.pipe(Effect.map((ctx) => {
    const context = Option.getOrUndefined(ctx)
    const scope = new Sentry.Scope()
    if (context) scope.setContext("context", context as unknown as Record<string, unknown>)
    if (extras) scope.setContext("extras", extras)
    const error = new CauseException(cause, name)
    scope.setContext("error", error.toJSON() as any)
    Sentry.captureException(error, scope)
  }))
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
  return RequestContextContainer.getOption.pipe(Effect.map((ctx) => {
    const context = Option.getOrUndefined(ctx)
    const scope = new Sentry.Scope()
    if (context) scope.setContext("context", context as unknown as Record<string, unknown>)
    if (extras) scope.setContext("extras", extras)
    Sentry.captureMessage(message, scope)

    console.warn(message)
  }))
}
