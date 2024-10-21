import { Effect, FiberRef, Layer } from "effect-app"
import type { RequestContext } from "../RequestContext.js"
import { LocaleRef, spanAttributes } from "../RequestContext.js"
import { RequestContextContainer } from "../services/RequestContextContainer.js"
import { ContextMapContainer } from "../services/Store/ContextMapContainer.js"
import { storeId } from "../services/Store/Memory.js"

const withRequestSpan = <R, E, A>(f: Effect<A, E, R>) =>
  Effect.andThen(
    RequestContextContainer.get,
    (ctx) =>
      f.pipe(
        Effect.withSpan("request " + ctx.name, { attributes: spanAttributes(ctx), captureStackTrace: false }),
        // TODO: false
        // request context info is picked up directly in the logger for annotations.
        Effect.withLogSpan("request")
      )
  )

const setupContextMap = Effect.andThen(ContextMapContainer, (_) => _.start).pipe(Layer.effectDiscard)

export function setupRequestContextFromCurrent<R, E, A>(self: Effect<A, E, R>) {
  return self
    .pipe(
      withRequestSpan,
      Effect.provide(setupContextMap)
    )
}

export function setupRequestContext<R, E, A>(self: Effect<A, E, R>, requestContext: RequestContext) {
  return Effect.gen(function*() {
    yield* FiberRef.set(LocaleRef, requestContext.locale)
    yield* FiberRef.set(storeId, requestContext.namespace)

    return yield* self
      .pipe(
        withRequestSpan,
        Effect.provide(setupContextMap)
      )
  })
}
