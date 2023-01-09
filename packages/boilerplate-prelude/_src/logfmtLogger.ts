import * as Logger from "@effect/io/Logger"
import type * as LogSpan from "@effect/io/Logger/Span"

export const logFmtLogger = Logger.make<string, string>(
  (fiberId, logLevel, message, cause, _context, spans, annotations, _runtime) => {
    const now = new Date()
    const nowMillis = now.getTime()

    const outputArray = [
      `timestamp=${now.toISOString()}`,
      `level=${logLevel.label}`,
      `fiber=${fiberId.threadName}`
    ]

    let output = outputArray.join(" ")

    if (message.length > 0) {
      output = output + " message="
      output = appendQuoted(message, output)
    }

    if (cause != null && cause != Cause.empty) {
      output = output + " cause="
      output = appendQuoted(cause.pretty(), output)
    }

    if (spans.isNonEmpty()) {
      output = output + " "

      let first = true
      for (const span of spans) {
        if (first) {
          first = false
        } else {
          output = output + " "
        }
        output = output + pipe(span, renderLogSpan(nowMillis))
      }
    }

    if (annotations.size > 0) {
      output = output + " "

      let first = true
      for (const [key, value] of annotations) {
        if (first) {
          first = false
        } else {
          output = output + " "
        }
        output = output + key.replace(/[ ="]/g, "_")
        output = output + "="
        output = appendQuoted(value, output)
      }
    }

    return output
  }
)

const appendQuoted = (label: string, output: string): string => {
  return output + JSON.stringify(label)
}

const renderLogSpan = (now: number) => {
  return (self: LogSpan.LogSpan): string => {
    const label = self.label.replace(/[ ="]/g, "_")
    return `${label}=${now - self.startTime}ms`
  }
}

export const replaceDefaultLoggerWithLogFmt = Logger.replace(Logger.defaultLogger, logFmtLogger)
