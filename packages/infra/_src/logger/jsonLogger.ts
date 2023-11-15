import { getRequestContext } from "./shared.js"

export const jsonLogger = Logger.make<unknown, void>(
  ({ annotations, cause, context, fiberId, logLevel, message, spans }) => {
    const now = new Date()
    const nowMillis = now.getTime()

    const c = getRequestContext(context)

    const data = {
      timestamp: now,
      level: logLevel.label,
      fiber: fiberId.threadName,
      message,
      request: c.value,
      cause: cause != null && cause != Cause.empty ? cause.pretty : undefined,
      spans: spans.map((_) => ({ label: _.label, timing: nowMillis - _.startTime })).toArray,
      annotations: annotations.size > 0
        ? [...annotations].reduce((prev, [k, v]) => {
          prev[k] = v
          return prev
        }, {} as Record<string, unknown>)
        : undefined
    }

    globalThis.console.log(JSON.stringify(data))
  }
)

export const logJson = Logger.replace(Logger.defaultLogger, jsonLogger)
