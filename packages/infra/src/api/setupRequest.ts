import { NonEmptyString255 } from "@effect-app/schema"
import { Effect, Layer, pipe } from "effect-app"
import { RequestId } from "effect-app/ids"
import { RequestContext } from "../RequestContext.js"
import { RequestContextContainer, spanAttributes } from "../services/RequestContextContainer.js"
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
  Effect.andThen(
    RequestContextContainer
      .get,
    (ctx) =>
      f.pipe(
        Effect.withSpan("request", { attributes: spanAttributes(ctx) }),
        // request context info is picked up directly in the logger for annotations.
        Effect.withLogSpan("request")
      )
  )

const setupContextMap = Effect.andThen(ContextMapContainer, (_) => _.start).pipe(Layer.effectDiscard)

// const RequestContextLiveFromRequestContext = (requestContext: RequestContext) =>
//   RequestContext.Tag.makeLayer(requestContext)
// memoization problem
// const RequestContextLive = RequestContextContainer.get.toLayer(RequestContext.Tag)
const RequestContextStartLiveFromRequestContext = (requestContext: RequestContext) =>
  Layer.provideMerge(
    setupContextMap,
    // .provideMerge(RequestContextLiveFromRequestContext(requestContext))
    Effect
      .andThen(RequestContextContainer, (_) => _.start(requestContext))
      .pipe(Layer.effectDiscard)
  )

const RequestContextStartLive = (requestContext: RequestContext | string) =>
  typeof requestContext === "string"
    ? pipe(
      makeInternalRequestContext(requestContext),
      Effect.andThen(RequestContextStartLiveFromRequestContext),
      Layer.unwrapEffect
    )
    : RequestContextStartLiveFromRequestContext(requestContext)

/**
 * @tsplus fluent effect/io/Effect setupRequestContext
 */
export function setupRequestContext<R, E, A>(self: Effect<A, E, R>, requestContext: RequestContext | string) {
  return self
    .pipe(
      withRequestSpan,
      Effect.provide(RequestContextStartLive(requestContext))
    )
}

const UpdateRequestContextLive = (f: (rc: RequestContext) => RequestContext) =>
  Effect.andThen(RequestContextContainer, (rcc) => rcc.update(f)).pipe(Layer.effectDiscard)

/**
 * @tsplus fluent effect/io/Effect updateRequestContext
 */
export function updateRequestContext<R, E, A>(self: Effect<A, E, R>, f: (rc: RequestContext) => RequestContext) {
  return Effect.provide(self, UpdateRequestContextLive(f))
}
