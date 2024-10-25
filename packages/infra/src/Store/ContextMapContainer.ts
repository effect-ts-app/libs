import { Data, Effect, FiberRef } from "effect-app"
import { ContextMap } from "./service.js"

// TODO: we have to create a new contextmap on every request.
// we want to share one map during startup
// but we want to make sure we don't re-use the startup map after startup
// we can call another start after startup. but it would be even better if we could Die on accessing rootmap
// we could also make the ContextMap optional, and when missing, issue a warning instead?

const ContextMapContainer = FiberRef.unsafeMake<ContextMap | "root">("root")

export class ContextMapNotStartedError extends Data.TaggedError("ContextMapNotStartedError") {}

export const getContextMap = FiberRef.get(ContextMapContainer).pipe(
  Effect.filterOrFail((_) => _ !== "root", () => new ContextMapNotStartedError())
)

export const startContextMap = Effect.flatMap(ContextMap.make, (_) => FiberRef.set(ContextMapContainer, _))
