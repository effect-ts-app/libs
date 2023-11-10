import { RequestId } from "@effect-app/prelude/ids"
import { RequestContext } from "../RequestContext.js"
import { RequestContextContainer } from "../services/RequestContextContainer.js"

/**
 * @tsplus fluent effect/io/Effect setupRequestFromWith
 */
export function setupReq3<R, E, A>(self: Effect<R, E, A>, name: string) {
  return makeInternalRequestContext(name)
    .flatMap((rc) => RequestContextContainer.flatMap((_) => _.start(rc)))
    > self
      .withRequestSpan
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

/** @tsplus getter effect/io/Effect withRequestSpan */
export const withRequestSpan = <R, E, A>(f: Effect<R, E, A>) =>
  RequestContextContainer
    .get
    .flatMap((ctx) =>
      f
        .withSpan(`request[${ctx.name}]#${ctx.id}`)
        .withLogSpan("request")
    )
