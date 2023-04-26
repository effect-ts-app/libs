import { getRequestContext } from "./shared.js"

export const jsonLogger = Logger.make<string, void>(
  (fiberId, logLevel, message, cause, context, spans, annotations) => {
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
      spans: Chunk.isNonEmpty(spans)
        ? spans.map((_) => ({ label: _.label, timing: nowMillis - _.startTime })).toArray
        : undefined,
      annotations: annotations.size > 0
        ? [...annotations].reduce((prev, [k, v]) => {
          prev[k] = v
          return prev
        }, {} as Record<string, string>)
        : undefined
    }

    globalThis.console.log(JSON.stringify(data))
  }
)

export const logJson = Logger.replace(Logger.defaultLogger, jsonLogger)
