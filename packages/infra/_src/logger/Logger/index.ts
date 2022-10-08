
export interface Meta {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [k: string]: any
}

export type LogFn = (message: string, meta?: Meta) => Effect<never, never, void>

export interface Logger {
  silly: LogFn
  debug: LogFn
  verbose: LogFn
  http: LogFn
  info: LogFn
  warn: LogFn
  error: LogFn
}

export type Level = keyof Logger

export const Logger = Tag<Logger>()

export const severity: Record<Level, number> = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
}

export const { debug, error, http, info, silly, verbose, warn } = Effect.deriveLifted(
  Logger
)(["debug", "error", "http", "info", "silly", "verbose", "warn"], [], [])
