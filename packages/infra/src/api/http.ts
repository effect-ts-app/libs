/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Route as HttpRoute, Router as HttpRouter } from "@effect/platform/Http/Router"

export type { HttpApp } from "@effect/platform/Http/App"
export type { Body as HttpBody } from "@effect/platform/Http/Body"
export * as HttpHeaders from "@effect/platform/Http/Headers"
export type { Middleware as HttpMiddleware } from "@effect/platform/Http/Middleware"
export { RouteContext as HttpRouteContext } from "@effect/platform/Http/Router"
export { RequestError as HttpRequestError } from "@effect/platform/Http/ServerError"
export { ServerRequest as HttpServerRequest } from "@effect/platform/Http/ServerRequest"
export type { ServerResponse as HttpServerResponse } from "@effect/platform/Http/ServerResponse"
export type { HttpRoute, HttpRouter }
export * as HttpServer from "@effect/platform/Http/Server"

/**
 * @tsplus unify effect/platform/Http/Router/Route
 */
export function unifyRoute<X extends HttpRoute<any, any>>(
  self: X
): HttpRoute<
  X extends HttpRoute<infer EX, any> ? EX : never,
  X extends HttpRoute<any, infer AX> ? AX : never
> {
  return self
}
