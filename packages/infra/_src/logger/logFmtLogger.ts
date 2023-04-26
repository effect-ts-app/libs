import { getRequestContext } from "./shared.js"

export const logfmtLogger = Logger.make<string, void>(
  (fiberId, logLevel, message, cause, context, spans, annotations) => {
    const c = getRequestContext(context)
    const requestContext = c.value
    if (requestContext) {
      annotations = HashMap.make(...[
        ...annotations,
        ...{
          requestRootId: requestContext.rootId,
          requestId: requestContext.id,
          requestName: requestContext.name,
          ...requestContext.userProfile?.sub ? { requestUserSub: requestContext.userProfile.sub } : {}
        }
          .$$
          .entries
      ])
    }
    const formatted = Logger.logfmtLogger.log(fiberId, logLevel, message, cause, context, spans, annotations)
    globalThis.console.log(formatted)
  }
)

export const logFmt = Logger.replace(Logger.defaultLogger, logfmtLogger)
