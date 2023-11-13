import * as Sentry from "@sentry/node"
import { CauseException } from "./errors.js"
import { RequestContextContainer } from "./services/RequestContextContainer.js"

export function reportError(
  name: string
) {
  return (cause: Cause<unknown>, extras?: Record<string, unknown>) =>
    Effect.gen(function*($) {
      if (cause.isInterrupted()) {
        yield* $(Effect.logDebug("Interrupted").annotateLogs("extras", JSON.stringify(extras ?? {})))
        return
      }
      yield* $(reportSentry(cause, name, extras))
      yield* $(
        cause
          .logError
          .annotateLogs({
            extras,
            // __cause__: error.toJSON(), // logs too much garbage
            __error_name__: name
          })
      )
    })
}

function reportSentry(
  cause: Cause<unknown>,
  name: string,
  extras: Record<string, unknown> | undefined
) {
  return RequestContextContainer.getOption.map((ctx) => {
    const context = ctx.value!
    const scope = new Sentry.Scope()
    if (context) scope.setContext("context", context as unknown as Record<string, unknown>)
    if (extras) scope.setContext("extras", extras)
    scope.setContext("error", cause.toJSON() as any)
    Sentry.captureException(new CauseException(cause, name), scope)
  })
}

export function logError<E>(
  name: string
) {
  return (cause: Cause<E>, extras?: Record<string, unknown>) =>
    Effect.gen(function*($) {
      if (cause.isInterrupted()) {
        yield* $(Effect.logDebug("Interrupted").annotateLogs("extras", JSON.stringify(extras ?? {})))
        return
      }
      yield* $(
        cause
          .logWarning
          .annotateLogs({
            extras,
            // __cause__: error.toJSON(), // logs too much garbage
            __error_name__: name
          })
      )
    })
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
