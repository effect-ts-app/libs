import { RequestContext } from "../../RequestContext.js"
import type { RequestContextContainer } from "../RequestContextContainer.js"
import type { ContextMapContainer } from "../Store/ContextMapContainer.js"

export interface QueueBase<Evt, DrainEvt> {
  makeDrain: <DrainE, DrainR>(
    makeHandleEvent: (ks: DrainEvt) => Effect<DrainR, DrainE, void>
  ) => Effect<Scope | RequestContextContainer | ContextMapContainer | DrainR, never, void>
  publish: (
    ...messages: NonEmptyReadonlyArray<Evt>
  ) => Effect<never, never, void>
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
