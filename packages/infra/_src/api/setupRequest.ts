import { RequestContext } from "../RequestContext.js"
import { RequestContextContainer, RequestContextContainerImpl } from "../services/RequestContextContainer.js"

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
        requestName: requestContext.name,
        ...requestContext.userId ? { requestUserId: requestContext.userId } : {}
      })
    )
  )
}

/**
 * @tsplus getter effect/io/Effect setupRequestFrom
 */
export function setupRequestFrom<R, E, A>(self: Effect<R, E, A>) {
  return Debug.untraced(() => RequestContextContainer.get.flatMap(requestContext => self.setupRequest(requestContext)))
}

/**
 * @tsplus fluent effect/io/Effect setupRequestFromWith
 */
export function setupReq3<R, E, A>(self: Effect<R, E, A>, name: string) {
  return Debug.untraced(() =>
    self
      .setupRequestFrom
      .provideService(RequestContextContainer, new RequestContextContainerImpl(makeInternalRequestContext(name)))
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
