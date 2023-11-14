import { getRequestContext } from "./shared.js"

export const logfmtLogger = Logger.make<unknown, void>(
  (_) => {
    let { annotations } = _
    const c = getRequestContext(_.context)
    const requestContext = c.value
    if (requestContext && requestContext.name !== "_root_") {
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
    const formatted = Logger.logfmtLogger.log({ ..._, annotations })
    globalThis.console.log(formatted)
  }
)

export const logFmt = Logger.replace(Logger.defaultLogger, logfmtLogger)
