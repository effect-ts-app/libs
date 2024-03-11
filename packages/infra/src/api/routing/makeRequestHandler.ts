/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import type { EnforceNonEmptyRecord } from "@effect-app/core/utils"
import { copy, pretty } from "@effect-app/core/utils"
import { snipString } from "@effect-app/infra/api/util"
import { reportError } from "@effect-app/infra/errorReporter"
import type { ValidationError } from "@effect-app/infra/errors"
import type { RequestContextContainer } from "@effect-app/infra/services/RequestContextContainer"
import type { ContextMapContainer } from "@effect-app/infra/services/Store/ContextMapContainer"
import type { Layer } from "effect-app"
import { Effect, FiberRef, Option, S } from "effect-app"
import type { HttpServerError } from "effect-app/http"
import { HttpBody, HttpRouter, HttpServerRequest, HttpServerResponse } from "effect-app/http"
import { NonEmptyString255 } from "effect-app/schema"
import type { REST, Schema, Struct } from "effect-app/schema"
import { updateRequestContext } from "../setupRequest.js"
import { makeRequestParsers, parseRequestParams } from "./base.js"
import type { RequestHandler, RequestHandlerBase } from "./base.js"

export const RequestSettings = FiberRef.unsafeMake({
  verbose: false
})

export type Middleware<
  R,
  M,
  PathA extends Struct.Fields,
  CookieA extends Struct.Fields,
  QueryA extends Struct.Fields,
  BodyA extends Struct.Fields,
  HeaderA extends Struct.Fields,
  ReqA extends PathA & QueryA & BodyA,
  ResA extends Struct.Fields,
  ResE,
  MiddlewareE,
  PPath extends `/${string}`,
  R2,
  PR,
  CTX,
  Context,
  Config
> = (
  handler: RequestHandler<
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
    Config
  >
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
  PathA extends Struct.Fields,
  CookieA extends Struct.Fields,
  QueryA extends Struct.Fields,
  BodyA extends Struct.Fields,
  HeaderA extends Struct.Fields,
  ReqA extends PathA & QueryA & BodyA,
  ResA extends Struct.Fields,
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
    req: HttpServerRequest.ServerRequest,
    res: HttpServerResponse.ServerResponse,
    r2: Effect<HttpServerResponse.ServerResponse, ValidationError | ResE | MiddlewareE, R>
  ) => Effect<HttpServerResponse.ServerResponse, never, RErr | R>,
  middlewareLayer?: Layer<PR, MiddlewareE, R2>
): Effect<
  HttpServerResponse.ServerResponse,
  HttpServerError.RequestError,
  | HttpRouter.RouteContext
  | HttpServerRequest.ServerRequest
  | RequestContextContainer
  | ContextMapContainer
  | RErr
  | Exclude<Exclude<R, EnforceNonEmptyRecord<M>>, PR>
  | R2
> {
  const { Request, Response, h: handle } = handler

  const response: REST.ReqRes<any, any, any> = Response ? Response : S.void
  const resp = response as typeof response & { struct?: Schema<any, any, any> }
  // TODO: consider if the alternative of using the struct schema is perhaps just better.
  const encoder = "struct" in resp && resp.struct
    ? S.encode(handler.rt === "raw" ? S.encodedSchema(resp.struct) : resp.struct)
    // ? (i: any) => {
    //   if (i instanceof (response as any)) return S.encodeSync(response)(i)
    //   else return S.encodeSync(response)(new (response as any)(i))
    // }
    : S.encode(handler.rt === "raw" ? S.encodedSchema(resp) : resp)
  // const encodeResponse = adaptResponse
  //   ? (req: ReqA) => Encoder.for(adaptResponse(req))
  //   : () => encoder

  const requestParsers = makeRequestParsers(Request)
  const parseRequest = parseRequestParams(requestParsers)

  const getParams = Effect.map(
    Effect
      .all({
        rcx: HttpRouter.RouteContext,
        req: Effect.flatMap(
          HttpServerRequest.ServerRequest,
          (req) => req.json.pipe(Effect.map((body) => ({ body, headers: req.headers })))
        )
      }),
    (
      { rcx, req }
    ) => ({
      params: rcx.params,
      query: rcx.searchParams,
      body: req.body,
      headers: req.headers,
      cookies: {} // req.cookies
    })
  )

  return Effect
    .gen(function*($) {
      const req = yield* $(HttpServerRequest.ServerRequest)
      const res = HttpServerResponse
        .empty()
        .pipe((_) => req.method === "GET" ? HttpServerResponse.setHeader(_, "Cache-Control", "no-store") : _)

      const pars = yield* $(getParams)

      const settings = yield* $(FiberRef.get(RequestSettings))

      const eff =
        // TODO: we don;t have access to user id here cause context is not yet created
        Effect
          .logInfo("Incoming request")
          .pipe(
            Effect.annotateLogs({
              method: req.method,
              path: req.originalUrl,
              ...(settings.verbose
                ? {
                  reqPath: pretty(pars.params),
                  reqQuery: pretty(pars.query),
                  reqBody: pretty(pars.body),
                  reqCookies: pretty(pars.cookies),
                  reqHeaders: pretty(pars.headers)
                }
                : undefined)
            }),
            Effect
              .andThen(
                Effect.suspend(() => {
                  const handleRequest = parseRequest(pars)
                    .pipe(
                      Effect.map(({ body, path, query }) => {
                        const hn = {
                          ...body.pipe(Option.getOrUndefined) ?? {},
                          ...query.pipe(Option.getOrUndefined) ?? {},
                          ...path.pipe(Option.getOrUndefined) ?? {}
                        } as unknown as ReqA
                        return hn
                      }),
                      Effect
                        .flatMap((parsedReq) =>
                          handle(parsedReq)
                            .pipe(
                              Effect.provideService(handler.Request.Tag, parsedReq as any),
                              Effect
                                .flatMap(encoder),
                              Effect
                                .map((r) =>
                                  res.pipe(
                                    HttpServerResponse.setBody(HttpBody.unsafeJson(r)),
                                    HttpServerResponse.setStatus(r === undefined ? 204 : 200)
                                  )
                                )
                            )
                        )
                    ) as Effect<
                      HttpServerResponse.ServerResponse,
                      ValidationError | ResE,
                      Exclude<R, EnforceNonEmptyRecord<M>>
                    >

                  // Commands should not be interruptable.
                  const r = req.method !== "GET" ? Effect.uninterruptible(handleRequest) : handleRequest // .instrument("Performance.RequestResponse")
                  const r2 = middlewareLayer
                    ? Effect.provide(r, middlewareLayer)
                    // PR is not relevant here
                    : (r as Effect<
                      HttpServerResponse.ServerResponse,
                      ResE | MiddlewareE | ValidationError,
                      Exclude<Exclude<R, EnforceNonEmptyRecord<M>>, PR>
                    >)
                  return errorHandler(
                    req,
                    res,
                    r2
                  )
                })
              ),
            Effect
              .catchAllCause((cause) =>
                Effect
                  .sync(() => HttpServerResponse.setStatus(res, 500))
                  .pipe(Effect
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
                              .pipe(Effect.annotateLogs({
                                method: req.method,
                                path: req.originalUrl,
                                statusCode: res.status.toString(),

                                reqPath: pretty(pars.params),
                                reqQuery: pretty(pars.query),
                                reqBody: pretty(pars.body),
                                reqCookies: pretty(pars.cookies),
                                reqHeaders: pretty(pars.headers),

                                resHeaders: pretty(
                                  Object
                                    .entries(headers)
                                    .reduce((prev, [key, value]) => {
                                      prev[key] = value && typeof value === "string" ? snipString(value) : value
                                      return prev
                                    }, {} as Record<string, any>)
                                )
                              }))
                          })
                        ], { concurrency: "inherit" })
                    ))
                  .pipe(
                    Effect.tapErrorCause((cause) =>
                      Effect.sync(() => console.error("Error occurred while reporting error", cause))
                    )
                  )
              ),
            Effect
              .tap((res) =>
                Effect
                  .logInfo("Finished request")
                  .pipe(Effect.annotateLogs({
                    method: req.method,
                    path: req.originalUrl,
                    statusCode: res.status.toString(),
                    ...(settings.verbose
                      ? {
                        resHeaders: pretty(res.headers)
                      }
                      : undefined)
                  }))
              )
          )

      return yield* $(eff)
    })
    .pipe((_) =>
      updateRequestContext(
        _,
        copy((_) => ({
          name: NonEmptyString255(
            handler.name
          )
        }))
      )
    )
}
