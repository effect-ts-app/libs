import { RequestContext } from "../RequestContext.js"

/**
 * @tsplus fluent effect/io/Effect setupRequest
 */
export function setupRequest<R, E, A>(self: Effect<R, E, A>, requestContext: RequestContext) {
  return Debug.untraced(() =>
    pipe(
      self.logSpan("request"),
      Effect.logAnnotates({
        requestRootId: requestContext.rootId,
        requestId: requestContext.id,
        requestName: requestContext.name
      })
    )
  )
}

/**
 * @tsplus getter effect/io/Effect setupRequestFrom
 */
export function setupRequestFrom<R, E, A>(self: Effect<R, E, A>) {
  return Debug.untraced(() => RequestContext.Tag.accessWithEffect(requestContext => self.setupRequest(requestContext)))
}

/**
 * @tsplus fluent effect/io/Effect setupRequestFromWith
 */
export function setupReq3<R, E, A>(self: Effect<R, E, A>, name: string) {
  return Debug.untraced(() =>
    self
      .setupRequestFrom
      .provideService(RequestContext.Tag, makeInternalRequestContext(name))
  )
}

function makeInternalRequestContext(name: string) {
  const id = StringId.make()
  return new RequestContext({
    id,
    rootId: id,
    locale: "en",
    name: ReasonableString(name)
  })
}
