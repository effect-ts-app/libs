/* eslint-disable @typescript-eslint/no-explicit-any */
import * as W from "winston"

import * as LOG from "../Logger/index.js"

export interface WinstonFactory {
  logger: Effect<never, never, W.Logger>
}

export const WinstonFactory = Tag<WinstonFactory>()

export const { logger } = Effect.deriveLifted(WinstonFactory)([], ["logger"], [])

export interface WinstonInstance {
  logger: W.Logger
}

export const WinstonInstance = Tag<WinstonInstance>()

export const LiveWinstonInstance = Layer.fromEffect(WinstonInstance)(
  logger.map((logger) => ({ logger }))
)

export const makeChild = (meta: LOG.Meta) =>
  Effect.gen(function* ($) {
    const { logger } = yield* $(WinstonInstance)
    const childLogger = logger.child(meta)
    return {
      logger: childLogger,
    } as WinstonInstance
  })

export const Child = (meta: LOG.Meta) =>
  Layer.fromEffect(WinstonInstance)(makeChild(meta))

export const provideChildLogger = (meta: LOG.Meta) =>
  Effect.environmentWithEffect((env) =>
    makeChild(meta).map((child) => env.add(WinstonInstance, child))
  )

/* istanbul ignore next */
export const LoggerFactory = (loggerOpts: W.LoggerOptions) =>
  Layer.fromValue(WinstonFactory, {
    logger: Effect.sync(() => W.createLogger(loggerOpts)),
  })

export const makeWinstonLogger = Effect.gen(function* ($) {
  // bogus call, so that the dependency is forced.
  // basically, WinstonInstance should not be considered a Singleton, but instead,
  // retrieved from the environment on each use, so that it can be overriden by child loggers etc.
  yield* $(WinstonInstance)
  return {
    debug: (message, meta) =>
      Effect.serviceWithEffect(WinstonInstance, (_) =>
        Effect.sync(() => _.logger.log("debug", message, meta))
      ) as any,
    http: (message, meta) =>
      Effect.serviceWithEffect(WinstonInstance, (_) =>
        Effect.sync(() => _.logger.log("http", message, meta))
      ) as any,
    silly: (message, meta) =>
      Effect.serviceWithEffect(WinstonInstance, (_) =>
        Effect.sync(() => _.logger.log("silly", message, meta))
      ) as any,
    error: (message, meta) =>
      Effect.serviceWithEffect(WinstonInstance, (_) =>
        Effect.sync(() => _.logger.log("error", message, meta))
      ) as any,
    info: (message, meta) =>
      Effect.serviceWithEffect(WinstonInstance, (_) =>
        Effect.sync(() => _.logger.log("info", message, meta))
      ) as any,
    verbose: (message, meta) =>
      Effect.serviceWithEffect(WinstonInstance, (_) =>
        Effect.sync(() => _.logger.log("verbose", message, meta))
      ) as any,
    warn: (message, meta) =>
      Effect.serviceWithEffect(WinstonInstance, (_) =>
        Effect.sync(() => _.logger.log("warn", message, meta))
      ) as any,
  } as LOG.Logger
})

export const WinstonLogger =
  LiveWinstonInstance > Layer.fromEffect(LOG.Logger)(makeWinstonLogger)
