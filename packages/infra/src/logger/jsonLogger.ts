import { Cause, FiberId, HashMap, List, Logger, Option } from "effect-app"
import { getRequestContext } from "./shared.js"

export const jsonLogger = Logger.make<unknown, void>(
  ({ annotations, cause, context, fiberId, logLevel, message, spans }) => {
    const now = new Date()
    const nowMillis = now.getTime()

    const c = getRequestContext(context)

    const data = {
      timestamp: now,
      level: logLevel.label,
      fiber: FiberId.threadName(fiberId),
      message,
      request: Option.getOrUndefined(c),
      cause: cause !== null && cause !== Cause.empty ? Cause.pretty(cause, { renderErrorCause: true }) : undefined,
      spans: List.map(spans, (_) => ({ label: _.label, timing: nowMillis - _.startTime })).pipe(List.toArray),
      annotations: HashMap.size(annotations) > 0
        ? [...annotations].reduce((prev, [k, v]) => {
          prev[k] = v
          return prev
        }, {} as Record<string, unknown>)
        : undefined
    }

    globalThis.console.log(JSON.stringify(data))
  }
)

export const logJson = Logger.replace(Logger.defaultLogger, Logger.withSpanAnnotations(jsonLogger))
