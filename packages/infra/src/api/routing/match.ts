/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import type { ValidationError } from "@effect-app/infra/errors"
import type { StructFields } from "effect-app/schema"
import { type RouteDescriptorAny } from "./schema/routing.js"
import type {} from "effect-app/utils"
import type { Layer, Ref, Scope } from "effect-app"
import { Context, Effect } from "effect-app"
import { HttpRouter } from "effect-app/http"
import type { HttpServerRequest, HttpServerResponse } from "effect-app/http"
import type { RequestHandler } from "./base.js"
import { makeRequestHandler } from "./makeRequestHandler.js"
import type { Middleware } from "./makeRequestHandler.js"

export const RouteDescriptors = Context.GenericTag<Ref<RouteDescriptorAny[]>>("@services/RouteDescriptors")

export function match<
  R,
  M,
  PathA extends StructFields,
  CookieA extends StructFields,
  QueryA extends StructFields,
  BodyA extends StructFields,
  HeaderA extends StructFields,
  ReqA extends PathA & QueryA & BodyA,
  ResA extends StructFields,
  ResE,
  MiddlewareE,
  PPath extends `/${string}`,
  R2,
  PR,
  RErr,
  CTX,
  Context,
  RT extends "raw" | "d",
  Config
>(
  requestHandler: RequestHandler<
    R,
    M,
    PathA,
    CookieA,
    QueryA,
    BodyA,
    HeaderA,
    ReqA,
    ResA,
    ResE,
    PPath,
    CTX,
    Context,
    RT,
    Config
  >,
  errorHandler: <R>(
    req: HttpServerRequest.ServerRequest,
    res: HttpServerResponse.ServerResponse,
    r2: Effect<HttpServerResponse.ServerResponse, ValidationError | MiddlewareE | ResE, R>
  ) => Effect<
    HttpServerResponse.ServerResponse,
    never,
    Exclude<RErr | R, HttpServerRequest.ServerRequest | HttpRouter.RouteContext | Scope>
  >,
  middleware?: Middleware<
    R,
    M,
    PathA,
    CookieA,
    QueryA,
    BodyA,
    HeaderA,
    ReqA,
    ResA,
    ResE,
    MiddlewareE,
    PPath,
    R2,
    PR,
    CTX,
    Context,
    RT,
    Config
  >
) {
  let middlewareLayer: Layer<PR, MiddlewareE, R2> | undefined = undefined
  if (middleware) {
    const { handler, makeRequestLayer } = middleware(requestHandler)
    requestHandler = handler as any // todo
    middlewareLayer = makeRequestLayer
  }
  return Effect.gen(function*() {
    // const rdesc = yield* $(RouteDescriptors.flatMap((_) => _.get))

    const handler = makeRequestHandler<
      R,
      M,
      PathA,
      CookieA,
      QueryA,
      BodyA,
      HeaderA,
      ReqA,
      ResA,
      ResE,
      MiddlewareE,
      R2,
      PR,
      RErr,
      PPath,
      RT,
      Config
    >(
      requestHandler as any, // one argument if no middleware, 2 if has middleware. TODO: clean this shit up
      errorHandler,
      middlewareLayer
    )

    const route = HttpRouter.makeRoute(
      requestHandler.Request.method,
      requestHandler.Request.path,
      handler
    )
    // TODO
    // rdesc.push(makeRouteDescriptor(
    //   requestHandler.Request.path,
    //   requestHandler.Request.method,
    //   requestHandler
    // ))
    return route
  })
}
