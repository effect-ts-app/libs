import * as Sentry from "@sentry/node"
import type { CauseException } from "./errors.js"
import { RequestContextContainer } from "./services/RequestContextContainer.js"

export function reportError<E, E2 extends CauseException<unknown>>(
  makeError: (cause: Cause<E>) => E2
) {
  return (cause: Cause<E>, extras?: Record<string, unknown>) =>
    Effect.gen(function*($) {
      if (cause.isInterrupted()) {
        yield* $(Effect.logDebug("Interrupted").annotateLogs("extras", JSON.stringify(extras ?? {})))
        return
      }
      const error = makeError(cause)
      yield* $(reportSentry(error, extras))
      yield* $(
        cause
          .logError
          .annotateLogs({
            extras,
            // __cause__: error.toJSON(), // logs too much garbage
            __error__: { _tag: error._tag, message: error.message }
          })
      )
    })
}

function reportSentry<E2 extends CauseException<unknown>>(
  error: E2,
  extras: Record<string, unknown> | undefined
) {
  return RequestContextContainer.getOption.map((ctx) => {
    const context = ctx.value!
    const scope = new Sentry.Scope()
    if (context) scope.setContext("context", context as unknown as Record<string, unknown>)
    if (extras) scope.setContext("extras", extras)
    scope.setContext("error", error.toJSON())
    Sentry.captureException(error, scope)
  })
}

export function logError<E, E2 extends CauseException<unknown>>(
  makeError: (cause: Cause<E>) => E2
) {
  return (cause: Cause<E>, extras?: Record<string, unknown>) =>
    Effect.gen(function*($) {
      if (cause.isInterrupted()) {
        yield* $(Effect.logDebug("Interrupted").annotateLogs("extras", JSON.stringify(extras ?? {})))
        return
      }
      const error = makeError(cause)
      yield* $(
        cause
          .logWarning
          .annotateLogs({
            extras,
            // __cause__: error.toJSON(), // logs too much garbage
            __error__: { _tag: error._tag, message: error.message }
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
