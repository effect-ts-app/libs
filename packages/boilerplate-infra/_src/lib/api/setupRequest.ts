import { RequestContext } from "../RequestContext.js"

/**
 * @tsplus fluent effect/core/io/Effect setupRequest
 */
export function setupRequest<R, E, A>(self: Effect<R, E, A>, requestContext: RequestContext) {
  return pipe(
    self.withSpan("request"),
    Effect.logAnnotates({ requestId: requestContext.id, requestName: requestContext.name })
  )
}

/**
 * @tsplus getter effect/core/io/Effect setupRequestFrom
 */
export function setupRequestFrom<R, E, A>(self: Effect<R, E, A>) {
  return RequestContext.Tag.withEffect(requestContext => self.setupRequest(requestContext))
}
