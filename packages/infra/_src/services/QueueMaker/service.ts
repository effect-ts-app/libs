import type { RequestContextContainer } from "../RequestContextContainer.js"
import type { ContextMapContainer } from "../Store/ContextMapContainer.js"

export interface QueueBase<RContext, Evt> {
  drain: Effect<Scope | RequestContextContainer | ContextMapContainer | RContext, never, void>
  publish: (
    ...messages: NonEmptyReadonlyArray<Evt>
  ) => Effect<never, never, void>
}

/**
 * @tsplus type QueueMaker.Ops
 */
export interface QueueMakerOps {}
export const QueueMaker: QueueMakerOps = {}
