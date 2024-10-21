import { Effect, FiberRef } from "effect-app"
import { HttpMiddleware, HttpServerRequest, HttpServerResponse } from "effect-app/http"
import { RequestId } from "effect-app/ids"
import { NonEmptyString255 } from "effect-app/schema"
import { Locale, LocaleRef, RequestContext } from "../../RequestContext.js"
import { RequestContextContainer } from "../../services/RequestContextContainer.js"
import { storeId } from "../../services/Store/Memory.js"
import { setupExistingRequestContext } from "../setupRequest.js"

export const RequestContextMiddleware = (defaultLocale: Locale = "en") =>
  HttpMiddleware.make((app) =>
    Effect.gen(function*() {
      const req = yield* HttpServerRequest.HttpServerRequest

      const currentSpan = yield* Effect.currentSpan.pipe(Effect.orDie)
      const supported = Locale.literals
      const desiredLocale = req.headers["x-locale"]
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      const locale = desiredLocale && supported.includes(desiredLocale as any)
        ? (desiredLocale as typeof supported[number])
        : defaultLocale

      const ns = req.headers["x-store-id"]
      const namespace = NonEmptyString255((ns && (Array.isArray(ns) ? ns[0] : ns)) || "primary")

      yield* FiberRef.set(storeId, namespace)
      yield* FiberRef.set(LocaleRef, locale)

      const deviceId = req.headers["x-fe-device-id"]

      const requestContext = new RequestContext({
        span: {
          traceId: RequestId(currentSpan.traceId),
          spanId: RequestId(currentSpan.spanId),
          sampled: currentSpan.sampled
        },
        name: NonEmptyString255(req.originalUrl), // set more detailed elsewhere
        locale,
        namespace,
        sourceId: deviceId ? NonEmptyString255(deviceId) : undefined
      })
      const rcc = yield* RequestContextContainer
      yield* rcc.update((_) => requestContext)
      const res = yield* setupExistingRequestContext(app, requestContext)

      // TODO: how to set also on errors?
      return HttpServerResponse.setHeaders(res, {
        "Content-Language": requestContext.locale
      })
    })
  )
