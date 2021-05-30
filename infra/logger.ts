import strip from "strip-ansi"
import * as winston from "winston"
import { format } from "winston"

const debugOnlyFormat = format((info) => (info.level === "debug" ? info : false))

const stripAnsi = format((info, _opts) => {
  info.message = strip(info.message)

  return info
})

const consoleFormatDev = winston.format.combine(
  debugOnlyFormat(),
  winston.format.colorize(),
  winston.format.simple()
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prettyJson = (obj: any): string => {
  return JSON.stringify(obj, undefined, 2)
}

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  stripAnsi(),
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  winston.format.printf((i) => `${i.timestamp} | ${i.message}. ${prettyJson(i)}`)
)

export const createLoggerConfig = (
  c: { devMode: boolean; service: string },
  meta?: Record<string, string>
) => ({
  defaultMeta: c.devMode ? meta : { service: c.service, ...meta },
  transports: c.devMode
    ? [
        new winston.transports.Console({
          level: "debug",
          format: consoleFormatDev,
        }),
        new winston.transports.Console({
          level: "error",
          format: consoleFormatDev,
        }),
        new winston.transports.File({
          level: "verbose",
          filename: "logs/combined.log",
          format: fileFormat,
        }),
        new winston.transports.File({
          filename: "logs/errors.log",
          level: "error",
          format: fileFormat,
        }),
      ]
    : [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        }),
      ],
})
