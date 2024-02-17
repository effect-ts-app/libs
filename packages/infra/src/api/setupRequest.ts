import { RequestId } from "effect-app/ids"
import { RequestContext } from "../RequestContext.js"
import { RequestContextContainer } from "../services/RequestContextContainer.js"
import { ContextMapContainer } from "../services/Store/ContextMapContainer.js"

function makeInternalRequestContext(name: string) {
  return Effect.sync(() => {
    const id = RequestId.make()
    return new RequestContext({
      id,
      rootId: id,
      locale: "en",
      name: NonEmptyString255(name)
    })
  })
}

const withRequestSpan = <R, E, A>(f: Effect<A, E, R>) =>
  RequestContextContainer
    .get
    .andThen((ctx) =>
      f
        .withSpan("request", { attributes: ctx.spanAttributes })
        // request context info is picked up directly in the logger for annotations.
        .withLogSpan("request")
    )

const setupContextMap = ContextMapContainer.andThen((_) => _.start).toLayerDiscard

// const RequestContextLiveFromRequestContext = (requestContext: RequestContext) =>
//   RequestContext.Tag.makeLayer(requestContext)
// memoization problem
// const RequestContextLive = RequestContextContainer.get.toLayer(RequestContext.Tag)
const RequestContextStartLiveFromRequestContext = (requestContext: RequestContext) =>
  setupContextMap
    // .provideMerge(RequestContextLiveFromRequestContext(requestContext))
    .provideMerge(
      RequestContextContainer
        .andThen((_) => _.start(requestContext))
        .toLayerDiscard
    )

const RequestContextStartLive = (requestContext: RequestContext | string) =>
  typeof requestContext === "string"
    ? makeInternalRequestContext(requestContext)
      .andThen(RequestContextStartLiveFromRequestContext)
      .unwrapLayer
    : RequestContextStartLiveFromRequestContext(requestContext)

/**
 * @tsplus fluent effect/io/Effect setupRequestContext
 */
export function setupRequestContext<R, E, A>(self: Effect<A, E, R>, requestContext: RequestContext | string) {
  return self
    .pipe(withRequestSpan)
    .provide(RequestContextStartLive(requestContext))
}

const UpdateRequestContextLive = (f: (rc: RequestContext) => RequestContext) =>
  RequestContextContainer.andThen((rcc) => rcc.update(f)).toLayerDiscard

/**
 * @tsplus fluent effect/io/Effect updateRequestContext
 */
export function updateRequestContext<R, E, A>(self: Effect<A, E, R>, f: (rc: RequestContext) => RequestContext) {
  return self
    // .provideServiceEffect(RequestContext.Tag, RequestContextContainer.get)
    .provide(UpdateRequestContextLive(f))
}
