import { HashMap, Logger, Option } from "effect-app"
import { getRequestContext } from "./shared.js"

export const logfmtLogger = Logger.make<unknown, void>(
  (_) => {
    let { annotations } = _
    const c = getRequestContext(_.context)
    const requestContext = Option.getOrUndefined(c)
    if (requestContext && requestContext.name !== "_root_") {
      annotations = HashMap.make(...[
        ...annotations,
        ...Object.entries({
          "request.root.id": requestContext.rootId,
          "request.id": requestContext.id,
          "request.name": requestContext.name,
          "request.namespace": requestContext.namespace,
          "request.locale": requestContext.locale,
          ...(requestContext.userProfile?.sub ? { "request.user.sub": requestContext.userProfile.sub } : {})
        })
      ])
    }
    const formatted = Logger.logfmtLogger.log({ ..._, annotations })
    globalThis.console.log(formatted)
  }
)

export const logFmt = Logger.replace(Logger.defaultLogger, logfmtLogger)
