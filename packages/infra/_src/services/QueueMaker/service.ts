import type { RequestContext } from "@effect-app/infra/RequestContext"

export interface QueueBase<RContext, Evt> {
  drain: Effect<Scope | RContext, never, void>
  publish: (
    ...messages: NonEmptyReadonlyArray<Evt>
  ) => Effect<RequestContext, never, void>
}

/**
 * @tsplus type QueueMaker.Ops
 */
export interface QueueMakerOps {}
export const QueueMaker: QueueMakerOps = {}
