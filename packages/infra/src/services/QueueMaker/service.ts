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
  span: struct({
    spanId: string,
    traceId: string,
    sampled: boolean.optional()
  })
    .optional()
})
