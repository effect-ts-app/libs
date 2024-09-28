import { Effect } from "effect-app"
import { HttpMiddleware, HttpServerRequest, HttpServerResponse } from "effect-app/http"
import { RequestId } from "effect-app/ids"
import { NonEmptyString255 } from "effect-app/schema"
import { Locale, RequestContext } from "../../RequestContext.js"
import { RequestContextContainer } from "../../services/RequestContextContainer.js"
import { setupExistingRequestContext } from "../setupRequest.js"

export const RequestContextMiddleware = (defaultLocale: Locale = "en") =>
  HttpMiddleware.make((app) =>
    Effect.gen(function*() {
      const req = yield* HttpServerRequest.HttpServerRequest

      const currentSpan = yield* Effect.currentSpan
      const parent = currentSpan?.parent ? currentSpan.parent.value : undefined
      const start = new Date()
      const supported = Locale.literals
      const desiredLocale = req.headers["x-locale"]
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      const locale = desiredLocale && supported.includes(desiredLocale as any)
        ? (desiredLocale as typeof supported[number])
        : defaultLocale

      const requestId = req.headers["request-id"]
      const rootId = parent?.spanId
        ? RequestId(parent.spanId)
        : requestId
        ? RequestId(requestId)
        : RequestId.make()

      const storeId = req.headers["x-store-id"]
      const namespace = NonEmptyString255((storeId && (Array.isArray(storeId) ? storeId[0] : storeId)) || "primary")

      const deviceId = req.headers["x-fe-device-id"]

      const requestContext = new RequestContext({
        id: currentSpan?.spanId ? RequestId(currentSpan.spanId) : RequestId.make(),
        rootId,
        name: NonEmptyString255(req.originalUrl), // set more detailed elsewhere
        locale,
        createdAt: start,
        namespace,
        sourceId: deviceId ? NonEmptyString255(deviceId) : undefined
        // ...(context.operation.parentId
        //   ? {
        //     parent: new RequestContextParent({
        //       id: RequestId(context.operation.parentId),
        //       locale,
        //       name: NonEmptyString255("API Request")
        //     })
        //   }
        //   : {})
      })
      const rcc = yield* RequestContextContainer
      yield* rcc.update((_) => requestContext)
      const res = yield* setupExistingRequestContext(app, requestContext)

      // TODO: how to set also on errors?
      return HttpServerResponse.setHeaders(res, {
        "request-id": requestContext.rootId,
        "Content-Language": requestContext.locale
      })
    })
  )
