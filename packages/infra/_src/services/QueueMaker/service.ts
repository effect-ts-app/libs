export interface QueueBase<RContext, Evt> {
  drain: Effect<Scope | RContext, never, void>
  publish: (
    ...messages: NonEmptyReadonlyArray<Evt>
  ) => Effect<never, never, void>
}

/**
 * @tsplus type QueueMaker.Ops
 */
export interface QueueMakerOps {}
export const QueueMaker: QueueMakerOps = {}
