import { RuntimeFlags } from "effect"
import { Context, FiberRef, Option, Runtime } from "effect-app"
import * as FiberRefs from "effect/FiberRefs"
import { RequestContextContainer } from "../services/RequestContextContainer.js"

export function getRequestContext(fiberRefs: FiberRefs.FiberRefs) {
  const context = FiberRefs.getOrDefault(fiberRefs, FiberRef.currentContext)
  const a = Context.getOption(context, RequestContextContainer)
  const c = Option.map(a, (_) => {
    // TODO: perhaps a litle expensive?
    const rt = Runtime.make({ context, fiberRefs, runtimeFlags: RuntimeFlags.none })
    return Runtime.runSync(rt)(_.requestContext)
  })
  return c
}
