import { Effect, FiberRef, Layer, Tracer } from "effect-app"
import { NonEmptyString255 } from "effect-app/Schema"
import { LocaleRef, RequestContext, spanAttributes } from "../RequestContext.js"
import { startContextMap } from "../Store/ContextMapContainer.js"
import { storeId } from "../Store/Memory.js"

export const getRequestContext = Effect
  .all({
    span: Effect.currentSpan.pipe(Effect.orDie),
    locale: FiberRef.get(LocaleRef),
    namespace: FiberRef.get(storeId)
  })
  .pipe(
    Effect.map(({ locale, namespace, span }) =>
      new RequestContext({
        span: Tracer.externalSpan(span),
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

const withRequestSpan = (name = "request", options?: Tracer.SpanOptions) => <R, E, A>(f: Effect<A, E, R>) =>
  Effect.andThen(
    getRC,
    (ctx) =>
      f.pipe(
        Effect.withSpan(name, {
          ...options,
          attributes: { ...spanAttributes(ctx), ...options?.attributes },
          captureStackTrace: false
        }),
        // TODO: false
        // request context info is picked up directly in the logger for annotations.
        Effect.withLogSpan(name)
      )
  )

const setupContextMap = startContextMap.pipe(Layer.effectDiscard)

export const setupRequestContextFromCurrent =
  (name = "request", options?: Tracer.SpanOptions) => <R, E, A>(self: Effect<A, E, R>) =>
    self
      .pipe(
        withRequestSpan(name, options),
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
