import { RequestId } from "@effect-app/prelude/ids"
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

const withRequestSpan = <R, E, A>(f: Effect<R, E, A>) =>
  RequestContextContainer
    .get
    .andThen((ctx) =>
      f
        .withSpan("request", { attributes: ctx.spanAttributes })
        // request context info is picked up directly in the logger for annotations.
        .withLogSpan("request")
    )

const setupContextMap = ContextMapContainer.andThen((_) => _.start).toLayerDiscard

const RequestContextLiveFromRequestContext = (requestContext: RequestContext) =>
  setupContextMap
    .provideMerge(
      RequestContextContainer
        .andThen((_) => _.start(requestContext))
        .toLayerDiscard
    )

const RequestContextLive = (requestContext: RequestContext | string) =>
  typeof requestContext === "string"
    ? makeInternalRequestContext(requestContext)
      .andThen(RequestContextLiveFromRequestContext)
      .unwrapLayer
    : RequestContextLiveFromRequestContext(requestContext)

/**
 * @tsplus fluent effect/io/Effect setupRequestContext
 */
export function setupRequestContext<R, E, A>(self: Effect<R, E, A>, requestContext: RequestContext | string) {
  return self
    .pipe(withRequestSpan)
    .provide(RequestContextLive(requestContext))
}
