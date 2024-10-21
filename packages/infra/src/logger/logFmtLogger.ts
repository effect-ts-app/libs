import { HashMap, Logger } from "effect-app"
import { spanAttributes } from "../RequestContext.js"
import { getRequestContextFromFiberRefs } from "./shared.js"

export const logfmtLogger = Logger.make<unknown, void>(
  (_) => {
    let { annotations } = _
    const requestContext = getRequestContextFromFiberRefs(_.context)
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

export const logFmt = Logger.replace(Logger.defaultLogger, Logger.withSpanAnnotations(logfmtLogger))
