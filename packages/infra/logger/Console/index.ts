import * as T from "@effect-ts/core/Effect"
import * as L from "@effect-ts/core/Effect/Layer"
import * as Has from "@effect-ts/core/Has"
import { pipe } from "@effect-ts-app/core/ext/Function"

import * as LOG from "../Logger"

function format(level: LOG.Level, message: string, meta?: LOG.Meta) {
  return `${level}: ${message}${meta ? `(${JSON.stringify({ meta })})` : ""}`
}

function log(
  config: Config,
  level: LOG.Level,
  message: string,
  meta?: LOG.Meta
): T.UIO<void> {
  return pipe(
    T.do,
    T.let("config", () => config),
    T.bind("formatter", (s) => T.succeed(s.config.formatter ?? format)),
    T.bind("level", (s) => T.succeed(s.config.level ?? "silly")),
    T.bind("msg", (s) => T.succeed(s.formatter(level, message, meta))),
    T.tap(({ level: configLevel, msg }) =>
      T.when(() => LOG.severity[configLevel] >= LOG.severity[level])(
        T.succeedWith(() => {
          switch (level) {
            case "info":
              // tslint:disable-next-line: no-console
              console.info(msg)
              break
            case "debug":
              // tslint:disable-next-line: no-console
              console.debug(msg)
              break
            case "error":
              // tslint:disable-next-line: no-console
              console.error(msg)
              break
            case "http":
              // tslint:disable-next-line: no-console
              console.info(msg)
              break
            case "silly":
              // tslint:disable-next-line: no-console
              console.debug(msg)
              break
            case "verbose":
              // tslint:disable-next-line: no-console
              console.debug(msg)
              break
            case "warn":
              // tslint:disable-next-line: no-console
              console.warn(msg)
              break
          }
        })
      )
    ),
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    T.map(() => {})
  )
}

export interface Config {
  formatter?: typeof format
  level?: LOG.Level
}

export interface ConsoleLoggerConfig extends Config {}

export const ConsoleLoggerConfig = Has.tag<ConsoleLoggerConfig>()

export const LiveConsoleLoggerConfig = (config: Config = {}) =>
  L.pure(ConsoleLoggerConfig)(config)

export const LiveConsoleLogger = L.fromEffect(LOG.Logger)(
  T.gen(function* ($) {
    const config = yield* $(ConsoleLoggerConfig)
    return {
      debug: (message, meta) => log(config, "debug", message, meta),
      http: (message, meta) => log(config, "http", message, meta),
      silly: (message, meta) => log(config, "silly", message, meta),
      error: (message, meta) => log(config, "error", message, meta),
      info: (message, meta) => log(config, "info", message, meta),
      verbose: (message, meta) => log(config, "verbose", message, meta),
      warn: (message, meta) => log(config, "warn", message, meta),
    }
  })
)
