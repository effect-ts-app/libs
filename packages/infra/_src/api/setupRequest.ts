import { RequestId } from "@effect-app/prelude/ids"
import { RequestContext } from "../RequestContext.js"
import { RequestContextContainer } from "../services/RequestContextContainer.js"
import { ContextMapContainer } from "../services/Store/ContextMapContainer.js"

/**
 * @tsplus fluent effect/io/Effect setupRequestContextFromName
 */
export function setupRequestContextFromName<R, E, A>(self: Effect<R, E, A>, name: string) {
  return makeInternalRequestContext(name).flatMap((rc) => setupRequestContext(self, rc))
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

const withRequestSpan = <R, E, A>(f: Effect<R, E, A>) =>
  RequestContextContainer
    .get
    .flatMap((ctx) =>
      f
        .withSpan(`request[${ctx.name}]#${ctx.id}`)
        .withLogSpan("request")
    )

function setupContextMap<R, E, A>(self: Effect<R, E, A>) {
  return (ContextMapContainer.flatMap((_) => _.start)
    > self)
}

/**
 * @tsplus fluent effect/io/Effect setupRequestContext
 */
export function setupRequestContext<R, E, A>(self: Effect<R, E, A>, requestContext: RequestContext) {
  return RequestContextContainer.flatMap((_) => _.start(requestContext))
    > withRequestSpan(setupContextMap(self))
}
