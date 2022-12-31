import type { Logger } from "@effect/io/Logger"
import { addLogger, LoggerTypeId } from "@effect/io/Logger"

/**
 * @tsplus static effect/io/Logger.Ops default
 */
export const defaultLogger: Logger<string, string> = {
  [LoggerTypeId]: {} as any,
  // [LoggerTypeId]: loggerVariance,
  log: (fiberId, logLevel, message, cause, _context, spans, annotations) => {
    const now = new Date()
    const nowMillis = now.getTime()

    let output = [
      `timestamp=${now.toISOString()}`,
      ` level=${logLevel.label}`,
      ` thread=#${fiberId.threadName}`
    ].join("")

    output = output + " message="
    output = appendQuoted(message, output)

    if (cause != null && cause != Cause.empty) {
      // TODO(Mike/Max): implement once tracing is complete
      // output = output + ` cause="${cause.prettyPrint()}"`
    }

    if (spans.length > 0) {
      output = output + " "

      let first = true
      for (const span of spans) {
        if (first) {
          first = false
        } else {
          output = output + " "
        }
        output = output + span.render(nowMillis)
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
}

function appendQuoted(label: string, output: string): string {
  return output + escapeLineBreaks(label)
  // if (label.indexOf(" ") < 0 || label.indexOf("\n") < 0) {
  //   return output + label
  // } else {
  //   return output + escapeLineBreaks(label) // `"${label}"`
  // }
}

function escapeLineBreaks(label: string): string {
  return JSON.stringify(label) // label.replace(/\n/g, "\\n")
}

// function appendQuoted(label: string, output: string): string {
//   const needs_quoting = label.indexOf(" ") > -1 || label.indexOf("=") > -1
//   const needs_escaping = label.indexOf("\"") > -1 || label.indexOf("\\") > -1

//   if (needs_escaping) label = label.replace(/["\\]/g, "\\$&")
//   if (needs_quoting) label = "\"" + label + "\""
//   if (label === "") label = "\"\""
//   return output + label
// }

/**
 * @tsplus static effect/io/Logger.Ops console
 */
export const consoleLogger: Logger<string, void> = defaultLogger.map(message => {
  console.log(message)
})

/**
 * @tsplus static effect/io/Logger.Ops consoleLoggerLayer
 */
export const consoleLoggerLayer = addLogger(consoleLogger)

// /**
//  * @tsplus static effect/io/Logger.Ops withConsoleLogger
//  */
// export const withConsoleLogger = FiberRef.currentLoggers.locallyWith(loggers => loggers.add(consoleLogger))
