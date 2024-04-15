import { S } from "effect-app"
import type { Effect, NonEmptyReadonlyArray, Scope } from "effect-app"
import { RequestContext } from "../../RequestContext.js"
import type { RequestContextContainer } from "../RequestContextContainer.js"
import type { ContextMapContainer } from "../Store/ContextMapContainer.js"

export interface QueueBase<Evt, DrainEvt> {
  drain: <DrainE, DrainR>(
    makeHandleEvent: (ks: DrainEvt) => Effect<void, DrainE, DrainR>,
    sessionId?: string
  ) => Effect<never, never, Scope | RequestContextContainer | ContextMapContainer | DrainR>
  publish: (
    ...messages: NonEmptyReadonlyArray<Evt>
  ) => Effect<void>
}

/**
 * @tsplus type QueueMaker.Ops
 */
export interface QueueMakerOps {}
export const QueueMaker: QueueMakerOps = {}

export const QueueMeta = S.Struct({
  requestContext: RequestContext,
  span: S.optional(S.Struct({
    spanId: S.String,
    traceId: S.String,
    sampled: S.Boolean
  }))
})
