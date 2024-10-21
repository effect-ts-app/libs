import { NonEmptyString255 } from "@effect-app/schema"
import { Effect, FiberRef, Layer } from "effect-app"
import { LocaleRef, RequestContext, spanAttributes } from "../RequestContext.js"
import { ContextMapContainer } from "../services/Store/ContextMapContainer.js"
import { storeId } from "../services/Store/Memory.js"

export const getRequestContext = Effect
  .all({
    span: Effect.currentSpan.pipe(Effect.orDie),
    locale: FiberRef.get(LocaleRef),
    namespace: FiberRef.get(storeId)
  })
  .pipe(
    Effect.map(({ locale, namespace, span }) =>
      new RequestContext({
        span,
        locale,
        namespace,
        // TODO: get through span context, or don't care at all.
        name: NonEmptyString255("_root_")
      })
    )
  )

export const getRC = Effect.all({
  locale: FiberRef.get(LocaleRef),
  namespace: FiberRef.get(storeId)
})

const withRequestSpan = (name = "request") => <R, E, A>(f: Effect<A, E, R>) =>
  Effect.andThen(
    getRC,
    (ctx) =>
      f.pipe(
        Effect.withSpan(name, { attributes: spanAttributes(ctx), captureStackTrace: false }),
        // TODO: false
        // request context info is picked up directly in the logger for annotations.
        Effect.withLogSpan(name)
      )
  )

const setupContextMap = Effect.andThen(ContextMapContainer, (_) => _.start).pipe(Layer.effectDiscard)

export const setupRequestContextFromCurrent = (name = "request") => <R, E, A>(self: Effect<A, E, R>) =>
  self
    .pipe(
      withRequestSpan(name),
      Effect.provide(setupContextMap)
    )

// TODO: consider integrating Effect.withParentSpan
export function setupRequestContext<R, E, A>(self: Effect<A, E, R>, requestContext: RequestContext) {
  return Effect.gen(function*() {
    yield* FiberRef.set(LocaleRef, requestContext.locale)
    yield* FiberRef.set(storeId, requestContext.namespace)

    return yield* self
      .pipe(
        withRequestSpan(requestContext.name),
        Effect.provide(setupContextMap)
      )
  })
}
