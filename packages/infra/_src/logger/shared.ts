import * as FiberRefs from "effect/FiberRefs"
import { RequestContextContainer } from "../services/RequestContextContainer.js"

export function getRequestContext(context: FiberRefs.FiberRefs) {
  const ctx = FiberRefs.getOrDefault(context, FiberRef.currentContext)
  // TODO: use `RequestContext.Tag` once switched?
  const a = ctx.getOption(RequestContextContainer)
  const c = a.map((_) => _.requestContext.runSync)
  return c
}
