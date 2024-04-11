import { HashMap, Logger, Option } from "effect-app"
import { spanAttributes } from "src/services/RequestContextContainer.js"
import { getRequestContext } from "./shared.js"

export const logfmtLogger = Logger.make<unknown, void>(
  (_) => {
    let { annotations } = _
    const c = getRequestContext(_.context)
    const requestContext = Option.getOrUndefined(c)
    if (requestContext && requestContext.name !== "_root_") {
      annotations = HashMap.make(...[
        ...annotations,
        ...Object.entries(spanAttributes(requestContext))
      ])
    }
    const formatted = Logger.logfmtLogger.log({ ..._, annotations })
    globalThis.console.log(formatted)
  }
)

export const logFmt = Logger.replace(Logger.defaultLogger, logfmtLogger)
