import { RequestContext } from "../RequestContext.js"

/**
 * @tsplus fluent effect/io/Effect setupRequest
 */
export function setupRequest<R, E, A>(self: Effect<R, E, A>, requestContext: RequestContext) {
  return pipe(
    self.withSpan("request"),
    Effect.logAnnotates({
      requestRootId: requestContext.rootId,
      requestId: requestContext.id,
      requestName: requestContext.name
    })
  )
}

/**
 * @tsplus getter effect/io/Effect setupRequestFrom
 */
export function setupRequestFrom<R, E, A>(self: Effect<R, E, A>) {
  return RequestContext.withEffect(requestContext => self.setupRequest(requestContext))
}
