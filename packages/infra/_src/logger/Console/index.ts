import * as LOG from "../Logger/index.js"

function format(level: LOG.Level, message: string, meta?: LOG.Meta) {
  return `${level}: ${message}${meta ? `(${JSON.stringify({ meta })})` : ""}`
}

function log(
  config: Config,
  level: LOG.Level,
  message: string,
  meta?: LOG.Meta
): Effect<never, never, void> {
  return Effect.sync(() => {
    const formatter = config.formatter ?? format
    const level = config.level ?? "silly"
    const msg = formatter(level, message, meta)
    return {
      config,
      formatter,
      level,
      msg,
    }
  })
    .tap(({ level: configLevel, msg }) =>
      Effect.when(
        () => LOG.severity[configLevel] >= LOG.severity[level],
        Effect.sync(() => {
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
    ) // eslint-disable-next-line @typescript-eslint/no-empty-function
    .map(() => {})
}

export interface Config {
  formatter?: typeof format
  level?: LOG.Level
}

export interface ConsoleLoggerConfig extends Config {}

export const ConsoleLoggerConfig = Tag<ConsoleLoggerConfig>()

export const LiveConsoleLoggerConfig = (config: Config = {}) =>
  Layer.fromValue(ConsoleLoggerConfig, config)

export const LiveConsoleLogger = Layer.fromEffect(LOG.Logger)(
  Effect.gen(function* ($) {
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
