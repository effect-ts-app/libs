import { RequestId } from "@effect-app/prelude/ids"
import { RequestContext } from "../RequestContext.js"
import { ContextMap, makeContextMap } from "../services/Store.js"

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
  RequestContext
    .Tag
    .flatMap((ctx) =>
      f
        .withSpan(`request[${ctx.name}]#${ctx.id}`)
        .withLogSpan("request")
    )

/**
 * @tsplus fluent effect/io/Effect setupRequestContext
 */
export function setupRequestContext<R, E, A>(self: Effect<R, E, A>, requestContext: RequestContext) {
  return self.pipe(
    withRequestSpan,
    Effect.provideService(ContextMap.Tag, makeContextMap()),
    Effect.provideService(RequestContext.Tag, requestContext)
  )
}
