/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import type { EnforceNonEmptyRecord } from "@effect-app/core/utils"
import { pretty } from "@effect-app/core/utils"
import { snipString } from "@effect-app/infra/api/util"
import { reportError } from "@effect-app/infra/errorReporter"
import type { ValidationError } from "@effect-app/infra/errors"
import type { RequestContextContainer } from "@effect-app/infra/services/RequestContextContainer"
import type { ContextMapContainer } from "@effect-app/infra/services/Store/ContextMapContainer"
import type { REST, StructFields } from "effect-app/schema"
import type { HttpRequestError } from "../http.js"
import { HttpBody, HttpRouteContext, HttpServerRequest, HttpServerResponse } from "../http.js"
import { makeRequestParsers, parseRequestParams } from "./base.js"
import type { RequestHandler, RequestHandlerBase } from "./base.js"

export const RequestSettings = FiberRef.unsafeMake({
  verbose: false
})

export type Middleware<
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
  CTX,
  Context,
  Config
> = (
  handler: RequestHandler<R, M, PathA, CookieA, QueryA, BodyA, HeaderA, ReqA, ResA, ResE, PPath, CTX, Context, Config>
) => {
  handler: RequestHandler<
    R2 | PR | RequestContextContainer | ContextMapContainer,
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
    Config
  >
  makeRequestLayer: Layer<PR, MiddlewareE, R2>
}

export function makeRequestHandler<
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
  R2,
  PR,
  RErr,
  PPath extends `/${string}`,
  Config
>(
  handler: RequestHandlerBase<
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
    Config
  >,
  errorHandler: <R>(
    req: HttpServerRequest,
    res: HttpServerResponse,
    r2: Effect<HttpServerResponse, ValidationError | ResE | MiddlewareE, R>
  ) => Effect<HttpServerResponse, never, RErr | R>,
  middlewareLayer?: Layer<PR, MiddlewareE, R2>
): Effect<
  HttpServerResponse,
  HttpRequestError,
  | HttpRouteContext
  | HttpServerRequest
  | RequestContextContainer
  | ContextMapContainer
  | RErr
  | Exclude<Exclude<R, EnforceNonEmptyRecord<M>>, PR>
  | R2
> {
  const { Request, Response, h: handle } = handler

  const response: REST.ReqRes<any, any, any> = Response ? Response : Void
  const resp = response as typeof response & { struct?: Schema<any, any, any> }
  // TODO: consider if the alternative of using the struct schema is perhaps just better.
  const encoder = "struct" in resp && resp.struct
    ? resp.struct.encode
    // ? (i: any) => {
    //   if (i instanceof (response as any)) return response.encodeSync(i)
    //   else return response.encodeSync(new (response as any)(i))
    // }
    : resp.encode
  // const encodeResponse = adaptResponse
  //   ? (req: ReqA) => Encoder.for(adaptResponse(req))
  //   : () => encoder

  const requestParsers = makeRequestParsers(Request)
  const parseRequest = parseRequestParams(requestParsers)

  const getParams = Effect
    .all({
      rcx: HttpRouteContext,
      req: HttpServerRequest.flatMap((req) => req.json.map((body) => ({ body, headers: req.headers })))
    })
    .map((
      { rcx, req }
    ) => ({
      params: rcx.params,
      query: rcx.searchParams,
      body: req.body,
      headers: req.headers,
      cookies: {} // req.cookies
    }))

  return Effect
    .gen(function*($) {
      const req = yield* $(HttpServerRequest)
      const res = HttpServerResponse
        .empty()
        .pipe((_) => req.method === "GET" ? _.setHeader("Cache-Control", "no-store") : _)

      const pars = yield* $(getParams)

      const settings = yield* $(RequestSettings.get)

      const eff =
        // TODO: we don;t have access to user id here cause context is not yet created
        Effect
          .logInfo("Incoming request")
          .annotateLogs({
            method: req.method,
            path: req.originalUrl,
            ...(settings.verbose
              ? {
                reqPath: pars.params.$$.pretty,
                reqQuery: pars.query.$$.pretty,
                reqBody: pretty(pars.body),
                reqCookies: pretty(pars.cookies),
                reqHeaders: pretty(pars.headers)
              }
              : undefined)
          })
          .andThen(
            Effect.suspend(() => {
              const handleRequest = parseRequest(pars)
                .map(({ body, path, query }) => {
                  const hn = {
                    ...body.value,
                    ...query.value,
                    ...path.value
                  } as unknown as ReqA
                  return hn
                })
                .flatMap((parsedReq) =>
                  handle(parsedReq)
                    .provideService(handler.Request.Tag, parsedReq)
                    .flatMap(encoder)
                    .map((r) =>
                      res
                        .setBody(HttpBody.unsafeJson(r))
                        .setStatus(r === undefined ? 204 : 200)
                    )
                ) as Effect<
                  HttpServerResponse,
                  ValidationError | ResE,
                  Exclude<R, EnforceNonEmptyRecord<M>>
                >

              // Commands should not be interruptable.
              const r = req.method !== "GET" ? handleRequest.uninterruptible : handleRequest // .instrument("Performance.RequestResponse")
              const r2 = middlewareLayer
                ? r.provide(middlewareLayer)
                // PR is not relevant here
                : (r as Effect<
                  HttpServerResponse,
                  ResE | MiddlewareE | ValidationError,
                  Exclude<Exclude<R, EnforceNonEmptyRecord<M>>, PR>
                >)
              return errorHandler(
                req,
                res,
                r2
              )
            })
          )
          .catchAllCause((cause) =>
            Effect
              .sync(() => res.setStatus(500))
              .tap((res) =>
                Effect
                  .all([
                    reportError("request")(cause, {
                      path: req.originalUrl,
                      method: req.method
                    }),
                    Effect.suspend(() => {
                      const headers = res.headers
                      return Effect
                        .logError("Finished request", cause)
                        .annotateLogs({
                          method: req.method,
                          path: req.originalUrl,
                          statusCode: res.status.toString(),

                          reqPath: pars.params.$$.pretty,
                          reqQuery: pars.query.$$.pretty,
                          reqBody: pretty(pars.body),
                          reqCookies: pretty(pars.cookies),
                          reqHeaders: pretty(pars.headers),

                          resHeaders: Object
                            .entries(headers)
                            .reduce((prev, [key, value]) => {
                              prev[key] = value && typeof value === "string" ? snipString(value) : value
                              return prev
                            }, {} as Record<string, any>)
                            .$$
                            .pretty
                        })
                    })
                  ], { concurrency: "inherit" })
              )
              .tapErrorCause((cause) => Effect.sync(() => console.error("Error occurred while reporting error", cause)))
          )
          .tap((res) =>
            Effect
              .logInfo("Finished request")
              .annotateLogs({
                method: req.method,
                path: req.originalUrl,
                statusCode: res.status.toString(),
                ...(settings.verbose
                  ? {
                    resHeaders: pretty(res.headers)
                  }
                  : undefined)
              })
          )

      return yield* $(eff)
    })
    .updateRequestContext((_) =>
      _.$$.copy({
        name: NonEmptyString255(
          handler.name
        )
      })
    )
}
