/* eslint-disable @typescript-eslint/no-explicit-any */
import * as T from "@effect-ts/core/Effect"
import * as L from "@effect-ts/core/Effect/Layer"
import * as Has from "@effect-ts/core/Has"
import { pipe } from "@effect-ts-app/core/ext/Function"
import * as W from "winston"

import * as LOG from "../Logger"

export interface WinstonFactory {
  logger: T.UIO<W.Logger>
}

export const WinstonFactory = Has.tag<WinstonFactory>()

export const { logger } = T.deriveLifted(WinstonFactory)([], ["logger"], [])

export interface WinstonInstance {
  logger: W.Logger
}

export const WinstonInstance = Has.tag<WinstonInstance>()

export const LiveWinstonInstance = L.fromEffect(WinstonInstance)(
  pipe(
    logger,
    T.map((logger) => ({ logger }))
  )
)

export const makeChild = (meta: LOG.Meta) =>
  T.gen(function* ($) {
    const { logger } = yield* $(WinstonInstance)
    const childLogger = logger.child(meta)
    return {
      logger: childLogger,
    } as WinstonInstance
  })

export const Child = (meta: LOG.Meta) => L.fromEffect(WinstonInstance)(makeChild(meta))

export const provideChildLogger = (meta: LOG.Meta) =>
  T.replaceServiceM(WinstonInstance, () => makeChild(meta))

/* istanbul ignore next */
export const LoggerFactory = (loggerOpts: W.LoggerOptions) =>
  L.pure(WinstonFactory)({
    logger: T.succeedWith(() => W.createLogger(loggerOpts)),
  })

export const makeWinstonLogger = T.gen(function* ($) {
  // bogus call, so that the dependency is forced.
  // basically, WinstonInstance should not be considered a Singleton, but instead,
  // retrieved from the environment on each use, so that it can be overriden by child loggers etc.
  yield* $(WinstonInstance)
  return {
    debug: (message, meta) =>
      T.accessServiceM(WinstonInstance)((_) =>
        T.succeedWith(() => _.logger.log("debug", message, meta))
      ) as any,
    http: (message, meta) =>
      T.accessServiceM(WinstonInstance)((_) =>
        T.succeedWith(() => _.logger.log("http", message, meta))
      ) as any,
    silly: (message, meta) =>
      T.accessServiceM(WinstonInstance)((_) =>
        T.succeedWith(() => _.logger.log("silly", message, meta))
      ) as any,
    error: (message, meta) =>
      T.accessServiceM(WinstonInstance)((_) =>
        T.succeedWith(() => _.logger.log("error", message, meta))
      ) as any,
    info: (message, meta) =>
      T.accessServiceM(WinstonInstance)((_) =>
        T.succeedWith(() => _.logger.log("info", message, meta))
      ) as any,
    verbose: (message, meta) =>
      T.accessServiceM(WinstonInstance)((_) =>
        T.succeedWith(() => _.logger.log("verbose", message, meta))
      ) as any,
    warn: (message, meta) =>
      T.accessServiceM(WinstonInstance)((_) =>
        T.succeedWith(() => _.logger.log("warn", message, meta))
      ) as any,
  } as LOG.Logger
})

export const WinstonLogger = L.fromEffect(LOG.Logger)(makeWinstonLogger)["<+<"](
  LiveWinstonInstance
)
