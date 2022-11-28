/* eslint-disable @typescript-eslint/no-explicit-any */
import type { _E, _R } from "@effect-ts-app/boilerplate-prelude/_ext/Prelude.ext"
import type { GetRequest, GetResponse } from "@effect-ts-app/boilerplate-prelude/schema"
import { extractSchema, SchemaNamed } from "@effect-ts-app/boilerplate-prelude/schema"
import * as MO from "@effect-ts-app/boilerplate-prelude/schema"
import * as Ex from "@effect-ts-app/infra/express/index"
import type {
  Encode,
  RequestHandler,
  RequestHandlerOptRes,
  RequestParsers
} from "@effect-ts-app/infra/express/schema/requestHandler"
import { parseRequestParams } from "@effect-ts-app/infra/express/schema/requestHandler"
import type { RouteDescriptorAny } from "@effect-ts-app/infra/express/schema/routing"
import { makeRouteDescriptor } from "@effect-ts-app/infra/express/schema/routing"
import type express from "express"
import type { ValidationError } from "../../errors.js"
import { RequestContext, RequestId } from "../../lib/RequestContext.js"
import type { SupportedErrors } from "./defaultErrorHandler.js"
import { defaultBasicErrorHandler } from "./defaultErrorHandler.js"
import { reportRequestError } from "./reportError.js"
import { snipString, snipValue } from "./util.js"

export function makeRequestParsers<
  R,
  PathA,
  CookieA,
  QueryA,
  BodyA,
  HeaderA,
  ReqA extends PathA & QueryA & BodyA,
  ResA,
  Errors
>(
  Request: RequestHandler<
    R,
    PathA,
    CookieA,
    QueryA,
    BodyA,
    HeaderA,
    ReqA,
    ResA,
    Errors
  >["Request"]
): RequestParsers<PathA, CookieA, QueryA, BodyA, HeaderA> {
  const ph = Effect(
    Maybe.fromNullable(Request.Headers)
      .map(s => s)
      .map(Parser.for)
      .map(MO.condemnFail)
  )
  const parseHeaders = (u: unknown) => ph.flatMapMaybe(d => d(u))

  const pq = Effect(
    Maybe.fromNullable(Request.Query)
      .map(s => s)
      .map(Parser.for)
      .map(MO.condemnFail)
  )
  const parseQuery = (u: unknown) => pq.flatMapMaybe(d => d(u))

  const pb = Effect(
    Maybe.fromNullable(Request.Body)
      .map(s => s)
      .map(Parser.for)
      .map(MO.condemnFail)
  )
  const parseBody = (u: unknown) => pb.flatMapMaybe(d => d(u))

  const pp = Effect(
    Maybe.fromNullable(Request.Path)
      .map(s => s)
      .map(Parser.for)
      .map(MO.condemnFail)
  )
  const parsePath = (u: unknown) => pp.flatMapMaybe(d => d(u))

  const pc = Effect(
    Maybe.fromNullable(Request.Cookie)
      .map(s => s)
      .map(Parser.for)
      .map(MO.condemnFail)
  )
  const parseCookie = (u: unknown) => pc.flatMapMaybe(d => d(u))

  return {
    parseBody,
    parseCookie,
    parseHeaders,
    parsePath,
    parseQuery
  }
}

export type MiddlewareHandler<ResE, R2 = never, PR = never> = (
  req: express.Request,
  res: express.Response,
  context: RequestContext
) => Layer<R2, ResE, PR>

export type Middleware<
  R,
  PathA,
  CookieA,
  QueryA,
  BodyA,
  HeaderA,
  ReqA extends PathA & QueryA & BodyA,
  ResA,
  ResE,
  R2 = never,
  PR = never
> = (
  handler: RequestHandler<R, PathA, CookieA, QueryA, BodyA, HeaderA, ReqA, ResA, ResE>
) => {
  handler: typeof handler
  handle: MiddlewareHandler<ResE, R2, PR>
}

export function match<
  R,
  E,
  PathA,
  CookieA,
  QueryA,
  BodyA,
  HeaderA,
  ReqA extends PathA & QueryA & BodyA,
  ResA,
  R2 = never,
  PR = never,
  RErr = never
>(
  requestHandler: RequestHandler<
    R,
    PathA,
    CookieA,
    QueryA,
    BodyA,
    HeaderA,
    ReqA,
    ResA,
    E
  >,
  errorHandler: <R>(
    req: express.Request,
    res: express.Response,
    requestContext: RequestContext,
    r2: Effect<R, E | ValidationError, void>
  ) => Effect<RErr, never, void>,
  middleware?: Middleware<
    R,
    PathA,
    CookieA,
    QueryA,
    BodyA,
    HeaderA,
    ReqA,
    ResA,
    E,
    R2,
    PR
  >
) {
  let makeMiddlewareLayer = undefined
  if (middleware) {
    const { handle, handler } = middleware(requestHandler)
    requestHandler = handler
    makeMiddlewareLayer = handle
  }
  return Ex.match(requestHandler.Request.method.toLowerCase() as any)(
    requestHandler.Request.path.split("?")[0],
    makeRequestHandler<R, E, PathA, CookieA, QueryA, BodyA, HeaderA, ReqA, ResA, R2, PR, RErr>(
      requestHandler,
      errorHandler,
      makeMiddlewareLayer
    )
  ).zipRight(
    Effect.sync(() =>
      makeRouteDescriptor(
        requestHandler.Request.path,
        requestHandler.Request.method,
        requestHandler
      )
    )
  )
}

export function respondSuccess<ReqA, A, E>(
  encodeResponse: (req: ReqA) => Encode<A, E>
) {
  return (req: ReqA, res: express.Response, a: A) =>
    Effect.sync(() => encodeResponse(req)(a))
      .flatMap(r =>
        Effect.sync(() => {
          r === undefined
            ? res.status(204).send()
            : res.status(200)
              .send(JSON.stringify(r))
        })
      )
}

export function makeRequestHandler<
  R,
  E,
  PathA,
  CookieA,
  QueryA,
  BodyA,
  HeaderA,
  ReqA extends PathA & QueryA & BodyA,
  ResA = void,
  R2 = never,
  PR = never,
  RErr = never
>(
  handler: RequestHandlerOptRes<
    R | PR,
    PathA,
    CookieA,
    QueryA,
    BodyA,
    HeaderA,
    ReqA,
    ResA,
    E
  >,
  errorHandler: <R>(
    req: express.Request,
    res: express.Response,
    requestContext: RequestContext,
    r2: Effect<R, E | ValidationError, void>
  ) => Effect<RErr | R, never, void>,
  makeMiddlewareLayer?: MiddlewareHandler<E, R2, PR>
) {
  const { Request, Response, adaptResponse, h: handle } = handler
  const response = Response ? extractSchema(Response as any) : Void
  const encoder = Encoder.for(response)
  const encodeResponse = adaptResponse
    ? (req: ReqA) => Encoder.for(adaptResponse(req))
    : () => encoder

  const requestParsers = makeRequestParsers(Request)
  const parseRequest = parseRequestParams(requestParsers)
  const respond = respondSuccess(encodeResponse)

  function getParams(req: express.Request) {
    return Effect.sync(() => ({
      path: req.params,
      query: req.query,
      body: req.body,
      headers: req.headers
        ? Object.entries(req.headers).reduce((prev, [key, value]) => {
          prev[key] = snipValue(value)
          return prev
        }, {} as Record<string, any>)
        : req.headers,
      cookies: req.cookies
        ? Object.entries(req.cookies).reduce((prev, [key, value]) => {
          prev[key] = typeof value === "string" || ROArray.isArray(value)
            ? snipValue(value)
            : value
          return prev
        }, {} as Record<string, any>)
        : req.cookies
    }))
  }

  function makeContext(req: express.Request) {
    const start = new Date()
    const supported = ["en", "de"] as const
    const desiredLocale = req.headers["x-locale"]
    const locale = desiredLocale && supported.includes(desiredLocale as any)
      ? (desiredLocale as typeof supported[number])
      : ("en" as const)

    // const context = getAppInsightsContext()
    // if (!context) {
    //   throw new Error("AI Context missing")
    // }

    const requestContext = new RequestContext({
      rootId: RequestId(StringId.make()),
      name: ReasonableString(
        Request.Model instanceof SchemaNamed ? Request.Model.name : Request.name
      ),
      locale,
      createdAt: start
      // ...(context.operation.parentId
      //   ? {
      //     parent: new RequestContextParent({
      //       id: RequestId(context.operation.parentId),
      //       locale,
      //       name: ReasonableString("API Request")
      //     })
      //   }
      //   : {})
    })
    // context.requestContext = requestContext
    return requestContext
  }

  return (req: express.Request, res: express.Response) => {
    const requestContext = makeContext(req)
    if (req.method === "GET") {
      res.setHeader("Cache-Control", "no-store")
    }
    res.setHeader("Content-Language", requestContext.locale)
    // get params once
    return getParams(req)
      .exit
      .flatMap(ex => {
        const handleRequest = ex
          .toEffect
          .tap(pars =>
            Effect.logInfo(
              `Processing Request: ${req.method} ${req.originalUrl} parameters: ${pars.$$.pretty}`
            )
          )
          .zipRight(
            parseRequest(req)
              .map(({ body, path, query }) => {
                const hn = {
                  ...body.value,
                  ...query.value,
                  ...path.value
                } as unknown as ReqA
                return hn
              })
            // .instrument("Performance.ParseRequest")
          )
          .flatMap(parsedReq =>
            handle(parsedReq as any)
              // .instrument("Performance.HandleRequest")
              .flatMap(r => respond(parsedReq, res, r) // .instrument("Performance.EncodeResponse")
              )
          )
        // Commands should not be interruptable.
        const r = (
          req.method !== "GET" ? handleRequest.uninterruptible : handleRequest
        ) // .instrument("Performance.RequestResponse")
        const r2 = makeMiddlewareLayer ? r.provideSomeLayer(makeMiddlewareLayer(req, res, requestContext)) : r
        return errorHandler(
          req,
          res,
          requestContext,
          r2.setupRequest(requestContext)
        )
      })
      .tapErrorCause(cause =>
        Effect.sync(() => {
          res.status(500).send()
          reportRequestError(cause, {
            requestContext,
            originalUrl: req.originalUrl,
            method: req.method
          })
        })
      )
      .tapBothInclAbort(
        () => {
          const headers = res.getHeaders()
          return Effect.logError(
            `Processed request: ${req.method} ${req.originalUrl} ${
              {
                statusCode: res.statusCode,
                headers: headers
                  ? Object.entries(headers).reduce((prev, [key, value]) => {
                    prev[key] = value && typeof value === "string" ? snipString(value) : value
                    return prev
                  }, {} as Record<string, any>)
                  : headers
              }.$$.pretty
            }`
          )
        },
        () => {
          const headers = res.getHeaders()
          return Effect.logInfo(
            `Processed request ${req.method} ${req.originalUrl} ${
              {
                statusCode: res.statusCode,
                headers: headers
                  ? Object.entries(headers).reduce((prev, [key, value]) => {
                    prev[key] = value && typeof value === "string" ? snipString(value) : value
                    return prev
                  }, {} as Record<string, any>)
                  : headers
              }.$$.pretty
            }`
          )
        }
      )
  }
}

export type RequestHandlers = { [key: string]: BasicRequestHandler }
export type BasicRequestHandler = RequestHandler<any, any, any, any, any, any, any, any, ValidationError>

export type AnyRequestHandler = RequestHandler<any, any, any, any, any, any, any, any, any>

type RouteAll<T extends RequestHandlers> = {
  [K in keyof T]: T[K] extends RequestHandler<
    infer R,
    any, // infer PathA,
    any, // infer CookieA,
    any, // infer QueryA,
    any, // infer BodyA,
    any, // infer HeaderA,
    any, // infer ReqA,
    any, // infer ResA,
    ValidationError // infer ResE
  > ? RouteMatch<R, never>
    : never
}

export type RouteMatch<
  R,
  // PathA,
  // CookieA,
  // QueryA,
  // BodyA,
  // HeaderA,
  // ReqA extends PathA & QueryA & BodyA,
  // ResA,
  PR = never
> = Effect<
  | Ex.ExpressAppConfig
  | Ex.ExpressApp
  | Exclude<
    R,
    PR
  >,
  never,
  RouteDescriptorAny // RouteDescriptor<R, PathA, CookieA, QueryA, BodyA, HeaderA, ReqA, ResA, SupportedErrors, Methods>
>

/**
 * Gather all handlers of a module and attach them to the Server.
 * Requires no login.
 */
export function matchAll<T extends RequestHandlers>(handlers: T) {
  const mapped = handlers.$$.keys.reduce((prev, cur) => {
    prev[cur] = match(handlers[cur] as AnyRequestHandler, defaultBasicErrorHandler)
    return prev
  }, {} as any) as RouteAll<typeof handlers>

  return mapped
}

/**
 * Gather all handlers of a module and attach them to the Server.
 * Requires no login.
 */
export function matchAllAlt<T extends RequestHandlersTest>(handlers: T) {
  const mapped = handlers.$$.keys.reduce((prev, cur) => {
    const matches = matchAll(handlers[cur])
    matches.$$.keys.forEach(key => prev[`${cur as string}.${key as string}`] = matches[key])
    return prev
  }, {} as any) as Flatten<RouteAllTest<typeof handlers>>

  return mapped
}

export type RequestHandlersTest = {
  [key: string]: Record<string, BasicRequestHandler>
}

export type RouteAllTest<T extends RequestHandlersTest> = {
  [K in keyof T]: RouteAll<T[K]>
}

// type JoinObjects<T extends Record<string, Record<string, any>> = { [`${K in keyof T }`]: RouteAll<T[K]> }

export type Flatten<T extends object> = object extends T ? object : {
  [K in keyof T]-?: (
    x: NonNullable<T[K]> extends infer V ? V extends object ? V extends readonly any[] ? Pick<T, K>
    : FlattenLVL1<V> extends infer FV ? ({
      [P in keyof FV as `${Extract<K, string | number>}.${Extract<P, string | number>}`]: FV[P]
    })
    : never
    : Pick<T, K>
      : never
  ) => void
} extends Record<keyof T, (y: infer O) => void> ? O extends unknown /* infer U */ ? { [K in keyof O]: O[K] } : never
: never

type FlattenLVL1<T extends object> = object extends T ? object : {
  [K in keyof T]-?: (
    x: NonNullable<T[K]> extends infer V ? V extends object ? V extends readonly any[] ? Pick<T, K>
    : /*: Flatten<V> extends infer FV ? ({
      [P in keyof FV as `${Extract<K, string | number>}.${Extract<P, string | number>}`]: FV[P]
    })
    : never
    */ Pick<T, K>
    : never
      : never
  ) => void
} extends Record<keyof T, (y: infer O) => void> ? O extends unknown /* infer U */ ? { [K in keyof O]: O[K] } : never
: never

export function handle<
  TModule extends Record<
    string,
    any // { Model: MO.SchemaAny; new (...args: any[]): any } | MO.SchemaAny
  >
>(
  _: TModule & { ResponseOpenApi?: any },
  adaptResponse?: any
) {
  // TODO: Prevent over providing // no strict/shrink yet.
  const Request = MO.extractRequest(_)
  const Response = MO.extractResponse(_)

  type ReqSchema = MO.GetRequest<TModule>
  type ResSchema = MO.GetResponse<TModule>
  type Req = InstanceType<
    ReqSchema extends { new(...args: any[]): any } ? ReqSchema
      : never
  >
  type Res = MO.ParsedShapeOf<Extr<ResSchema>>

  return <R, E>(
    h: (r: Req) => Effect<R, E, Res>
  ) => ({
    adaptResponse,
    h,
    Request,
    Response,
    ResponseOpenApi: _.ResponseOpenApi ?? Response
  } as ReqHandler<
    Req,
    R,
    E,
    Res,
    ReqSchema,
    ResSchema
  >)
}

export type Extr<T> = T extends { Model: MO.SchemaAny } ? T["Model"]
  : T extends MO.SchemaAny ? T
  : never

export interface ReqHandler<
  Req,
  R,
  E,
  Res,
  ReqSchema extends MO.SchemaAny,
  ResSchema extends MO.SchemaAny,
  CTX = any
> {
  h: (r: Req, ctx: CTX) => Effect<R, E, Res>
  Request: ReqSchema
  Response: ResSchema
  ResponseOpenApi: any
}

/**
 * Provided a module with resources, and provided an Object with resource handlers, will prepare route handlers to be attached to server.
 * @param mod The module with Resources you want to match.
 * @returns A function that must be called with an Object with a handler "Request -> Effect<R, E, Response>" for each resource defined in the Module.
 *
 * Example:
 * ```
 * class SayHelloRequest extends Get("/say-hello")<SayHelloRequest>()({ name: prop(ReasonableString) }) {}
 * class SayHelloResponse extends Model<SayHelloRequest>()({ message: prop(LongString) }) {}
 *
 * export const SayHelloControllers = matchResource({ SayHello: { SayHelloRequest, SayHelloResponse } })({
 *   SayHello: (req) => Effect({ message: `Hi ${req.name}` })
 * })
 * ```
 */
export function matchResource<TModules extends Record<string, Record<string, any>>>(mod: TModules) {
  type Keys = keyof TModules
  return <
    THandlers extends {
      [K in Keys]: (
        req: ReqFromSchema<GetRequest<TModules[K]>>
      ) => Effect<any, SupportedErrors, ResFromSchema<GetResponse<TModules[K]>>>
    }
  >(
    handlers: THandlers
  ) => {
    const handler = mod.$$.keys.reduce((prev, cur) => {
      prev[cur] = handle(mod[cur])(handlers[cur] as any)
      return prev
    }, {} as any)
    type HNDLRS = typeof handlers
    return handler as {
      [K in Keys]: ReqHandler<
        ReqFromSchema<GetRequest<TModules[K]>>,
        _R<ReturnType<HNDLRS[K]>>,
        _E<ReturnType<HNDLRS[K]>>,
        ResFromSchema<GetResponse<TModules[K]>>,
        GetRequest<TModules[K]>,
        GetResponse<TModules[K]>
      >
    }
  }
}

export type ReqFromSchema<ReqSchema> = InstanceType<
  ReqSchema extends { new(...args: any[]): any } ? ReqSchema
    : never
>

export type ResFromSchema<ResSchema> = ParsedShapeOf<Extr<ResSchema>>
