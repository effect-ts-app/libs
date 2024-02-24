import { RuntimeFlags } from "effect"
import { FiberRef, Runtime } from "effect-app"
import * as FiberRefs from "effect/FiberRefs"
import { RequestContextContainer } from "../services/RequestContextContainer.js"

export function getRequestContext(fiberRefs: FiberRefs.FiberRefs) {
  const context = FiberRefs.getOrDefault(fiberRefs, FiberRef.currentContext)
  const a = context.getOption(RequestContextContainer)
  const c = a.map((_) => {
    // TODO: perhaps a litle expensive?
    const rt = Runtime.make({ context, fiberRefs, runtimeFlags: RuntimeFlags.none })
    return rt.runSync(_.requestContext)
  })
  return c
}
