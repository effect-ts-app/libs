import type { Effect } from "effect/Effect"
import { type TrustedProxyOptions, xForwardedHeaders as xForwardedHeadersUpstream } from "effect/http/HttpMiddleware"
import type { HttpServerRequest } from "effect/http/HttpServerRequest"
import type { HttpServerResponse } from "effect/http/HttpServerResponse"

export type { HttpMiddleware, TrustedProxyOptions } from "effect/http/HttpMiddleware"

export { compression, cors, decompression, layerTracerDisabledForUrls, logger, make, searchParamsParser, SpanNameGenerator, tracer, TracerDisabledWhen, TracerHeaderFilter, withLoggerDisabled } from "effect/http/HttpMiddleware"

type ForwardedApp<E, R> = Effect<HttpServerResponse, E, R | HttpServerRequest>

// Effect 4.0.6 types this factory as `HttpMiddleware`, whose call signature
// returns `Effect<HttpServerResponse, any, any>`. The middleware only updates
// the current `HttpServerRequest`, so the app's error and requirements stay.
export const xForwardedHeaders =
  (options: TrustedProxyOptions) => <E, R>(httpApp: ForwardedApp<E, R>): ForwardedApp<E, R> =>
    xForwardedHeadersUpstream(options)(httpApp) as ForwardedApp<E, R>
