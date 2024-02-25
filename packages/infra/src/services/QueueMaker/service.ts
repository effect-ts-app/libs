import { struct } from "@effect-app/schema"
import { type Effect, type NonEmptyReadonlyArray, S, type Scope } from "effect-app"
import { RequestContext } from "../../RequestContext.js"
import type { RequestContextContainer } from "../RequestContextContainer.js"
import type { ContextMapContainer } from "../Store/ContextMapContainer.js"

export interface QueueBase<Evt, DrainEvt> {
  makeDrain: <DrainE, DrainR>(
    makeHandleEvent: (ks: DrainEvt) => Effect<void, DrainE, DrainR>
  ) => Effect<void, never, Scope | RequestContextContainer | ContextMapContainer | DrainR>
  publish: (
    ...messages: NonEmptyReadonlyArray<Evt>
  ) => Effect<void>
}

/**
 * @tsplus type QueueMaker.Ops
 */
export interface QueueMakerOps {}
export const QueueMaker: QueueMakerOps = {}

export const QueueMeta = struct({
  requestContext: RequestContext,
  span: S.optional(struct({
    spanId: S.string,
    traceId: S.string,
    sampled: S.optional(S.boolean)
  }))
})
