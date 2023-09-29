import { RequestId } from "@effect-app/prelude/ids"
import { RequestContext } from "../RequestContext.js"
import { RequestContextContainer, RequestContextContainerImpl } from "../services/RequestContextContainer.js"

/**
 * @tsplus fluent effect/io/Effect setupRequestFromWith
 */
export function setupReq3<R, E, A>(self: Effect<R, E, A>, name: string) {
  return makeInternalRequestContext(name).flatMap((rc) =>
    self
      .withSpan("request")
      .provideService(RequestContextContainer, new RequestContextContainerImpl(rc))
  )
}

function makeInternalRequestContext(name: string) {
  return Effect.sync(() => {
    const id = RequestId.make()
    return new RequestContext({
      id,
      rootId: id,
      locale: "en",
      name: ReasonableString(name)
    })
  })
}
