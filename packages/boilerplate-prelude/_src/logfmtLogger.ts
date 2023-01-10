import { currentMinimumLogLevel } from "@effect/io/FiberRef"
import * as FiberRefs from "@effect/io/FiberRefs"
import * as Logger from "@effect/io/Logger"
import * as LogLevel from "@effect/io/Logger/Level"
import type * as LogSpan from "@effect/io/Logger/Span"

export const logFmtLoggerToString = Logger.make<string, string>(
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
        output = output + filterKeyName(key)
        output = output + "="
        output = appendQuoted(value, output)
      }
    }

    return output
  }
)

export const logFmtLogger = Logger.make<string, void>(
  (fiberId, logLevel, message, cause, context, spans, annotations, runtime) => {
    const formatted = logFmtLoggerToString.log(
      fiberId,
      logLevel,
      message,
      cause,
      context,
      spans,
      annotations,
      runtime
    )
    const filter = FiberRefs.getOrDefault(currentMinimumLogLevel)(context)
    if (LogLevel.greaterThanEqual(filter)(logLevel)) {
      globalThis.console.log(formatted)
    }
  }
)

function filterKeyName(key: string) {
  return key.replace(/[\s="]/g, "_")
}

function escapeDoubleQuotes(str: string) {
  return str.replace(/\\([\s\S])|(")/g, "\\$1$2")
}

const textOnly = /^[^\s"=]+$/
const appendQuoted = (label: string, output: string): string => {
  return output + (label.match(textOnly) ? label : `"${escapeDoubleQuotes(label)}"`)
}

const renderLogSpan = (now: number) => {
  return (self: LogSpan.LogSpan): string => {
    const label = filterKeyName(self.label)
    return `${label}=${now - self.startTime}ms`
  }
}

export const replaceDefaultLoggerWithLogFmt = Logger.replace(Logger.defaultLogger, logFmtLogger)
