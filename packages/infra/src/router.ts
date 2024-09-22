/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { EffectUnunified, LowerServices } from "@effect-app/core/Effect"
import { allLower } from "@effect-app/core/Effect"
import { typedKeysOf } from "@effect-app/core/utils"
import type { Compute, EnforceNonEmptyRecord } from "@effect-app/core/utils"
import type {
  _E,
  _R,
  EffectDeps,
  JWTError,
  Middleware,
  ReqHandler,
  RequestHandler
} from "@effect-app/infra/api/routing"
import { defaultErrorHandler, makeRequestHandler } from "@effect-app/infra/api/routing"
import type { Layer, Scope } from "effect-app"
import { Effect, Predicate, S } from "effect-app"
import type { SupportedErrors, ValidationError } from "effect-app/client/errors"
import { HttpRouter } from "effect-app/http"
import type { HttpServerRequest, HttpServerResponse } from "effect-app/http"
import type { Struct } from "effect-app/schema"
import { REST } from "effect-app/schema"
import type {} from "@effect/schema/ParseResult"

export type RouteMatch<
  R,
  M,
  // TODO: specific errors
  // Err extends SupportedErrors | S.ParseResult.ParseError,
  PR = never
> // RErr = never,
 = HttpRouter.Route<never, Exclude<Exclude<R, EnforceNonEmptyRecord<M>>, PR>>

export interface Hint<Err extends string> {
  Err: Err
}

type HandleVoid<Expected, Actual, Result> = [Expected] extends [void]
  ? [Actual] extends [void] ? Result : Hint<"You're returning non void for a void Response, please fix">
  : Result

type AnyRequestModule = S.Schema.Any & { success?: S.Schema.Any; failure?: S.Schema.Any }

type GetSuccess<T> = T extends { success: S.Schema.Any } ? T["success"] : typeof S.Void

type GetSuccessShape<Action extends { success?: S.Schema.Any }, RT extends "d" | "raw"> = RT extends "raw"
  ? S.Schema.Encoded<GetSuccess<Action>>
  : S.Schema.Type<GetSuccess<Action>>
type GetFailure<T extends { failure?: S.Schema.Any }> = T["failure"] extends never ? typeof S.Never : T["failure"]

export interface Handler<Action extends AnyRequestModule, RT extends "raw" | "d", A, E, R, Context> {
  new(): {}
  _tag: RT
  handler: (
    req: S.Schema.Type<Action>,
    ctx: Context
  ) => Effect<
    A,
    E,
    R
  >
}

// Separate "raw" vs "d" to verify A
type AHandler<Action extends AnyRequestModule> =
  | Handler<
    Action,
    "raw",
    S.Schema.Encoded<GetSuccess<Action>>,
    SupportedErrors | S.ParseResult.ParseError | S.Schema.Type<GetFailure<Action>>,
    any,
    any
  >
  | Handler<
    Action,
    "d",
    S.Schema.Type<GetSuccess<Action>>,
    SupportedErrors | S.ParseResult.ParseError | S.Schema.Type<GetFailure<Action>>,
    any,
    any
  >

/**
 * Middleware is inactivate by default, the Key is optional in route context, and the service is optionally provided as Effect Context
 */
export type ContextMap<Key, Service> = [Key, Service, true]
/**
 * Middleware is active by default, and provides the Service at Key in route context, and the Service is provided as Effect Context
 */
export type ContextMapInverted<Key, Service> = [Key, Service, false]

// For CTXMap, handled by `handleRequestEnv` middleware:
// ["configurationKey", ["contextKey", ServiceShape, defaultOffBoolean]]
// defaultOffBoolean:
// false means: if not configured, or set to false, the item is considered active.
// true means: if configured as true, the item is considered active.
// not active means the service is not in the context, and in route context is marked as optional.
export const makeRouter = <CTX, CTXMap extends Record<string, [string, any, boolean]>>(
  handleRequestEnv: any /* Middleware */
) => {
  type GetRouteContext<T> =
    & CTX
    // inverted
    & {
      [
        key in keyof CTXMap as CTXMap[key][2] extends true ? never
          : key extends keyof T ? T[key] extends true ? CTXMap[key][0] : never
          : never
      ]?: CTXMap[key][1]
    }
    & {
      [
        key in keyof CTXMap as CTXMap[key][2] extends true ? never
          : key extends keyof T ? T[key] extends false ? CTXMap[key][0] : never
          : CTXMap[key][0]
      ]: CTXMap[key][1]
    }
    // normal
    & {
      [
        key in keyof CTXMap as CTXMap[key][2] extends false ? never
          : key extends keyof T ? T[key] extends true ? CTXMap[key][0] : never
          : never
      ]: CTXMap[key][1]
    }
    & {
      [
        key in keyof CTXMap as CTXMap[key][2] extends false ? never
          : key extends keyof T ? T[key] extends false ? CTXMap[key][0] : never
          : CTXMap[key][0]
      ]?: CTXMap[key][1]
    }

  type Values<T extends Record<any, any>> = T[keyof T]

  type GetEffectContext<T> = Values<
    // inverted
    & {
      [
        key in keyof CTXMap as CTXMap[key][2] extends true ? never
          : key extends keyof T ? T[key] extends true ? never : CTXMap[key][0]
          : CTXMap[key][0]
      ]: // TODO: or as an Optional available?
        CTXMap[key][1]
    }
    // normal
    & {
      [
        key in keyof CTXMap as CTXMap[key][2] extends false ? never
          : key extends keyof T ? T[key] extends true ? CTXMap[key][0] : never
          : never
      ]: // TODO: or as an Optional available?
        CTXMap[key][1]
    }
  >

  function match<
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
    RErr,
    CTX,
    Context,
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
      Config
    >,
    errorHandler: <R>(
      req: HttpServerRequest.HttpServerRequest,
      res: HttpServerResponse.HttpServerResponse,
      r2: Effect<HttpServerResponse.HttpServerResponse, ValidationError | MiddlewareE | ResE, R>
    ) => Effect<
      HttpServerResponse.HttpServerResponse,
      never,
      Exclude<RErr | R, HttpServerRequest.HttpServerRequest | HttpRouter.RouteContext | Scope>
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
      Config
    >
  ) {
    let middlewareLayer: Layer<PR, MiddlewareE, R2> | undefined = undefined
    if (middleware) {
      const { handler, makeRequestLayer } = middleware(requestHandler)
      requestHandler = handler as any // todo
      middlewareLayer = makeRequestLayer
    }
    // const rdesc = yield* RouteDescriptors.flatMap((_) => _.get)

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
      Config
    >(
      requestHandler as any, // one argument if no middleware, 2 if has middleware. TODO: clean this shit up
      errorHandler,
      middlewareLayer
    )

    const route = HttpRouter.makeRoute(
      requestHandler.Request.method,
      requestHandler.Request.path,
      handler.pipe(
        Effect.withSpan("Request." + requestHandler.name, { captureStackTrace: () => (requestHandler as any).stack })
      )
    )
    // TODO
    // rdesc.push(makeRouteDescriptor(
    //   requestHandler.Request.path,
    //   requestHandler.Request.method,
    //   requestHandler
    // ))
    return route
  }

  function handle<
    ReqSchema extends AnyRequestModule
  >(
    _: ReqSchema & { ResponseOpenApi?: any },
    name: string,
    adaptResponse?: any
  ) {
    const Request = S.REST.extractRequest(_)
    const Response = S.REST.extractResponse(_)
    type ResSchema = GetSuccess<ReqSchema>
    type Req = S.Schema.Type<ReqSchema>
    type Res = S.Schema.Type<ResSchema> // TODO: depends on raw

    return <R, E>(
      h: { _tag: "raw" | "d"; handler: (r: Req) => Effect<Res, E, R>; stack?: string }
    ) => ({
      adaptResponse,
      stack: h.stack,
      h: h.handler,
      name,
      Request,
      Response,
      ResponseOpenApi: _.ResponseOpenApi ?? Response,
      Context: null as any,
      CTX: null as any,
      rt: h._tag
    } as ReqHandler<
      Req,
      R,
      E,
      Res,
      ReqSchema,
      ResSchema,
      GetRouteContext<Req>,
      GetEffectContext<Req>
    >)
  }

  function matchFor<Rsc extends Record<string, any>>(
    rsc: Rsc
  ) {
    type Filtered = {
      [K in keyof Rsc as Rsc[K] extends { Response: any } ? K : never]: Rsc[K] extends { Response: any } ? Rsc[K]
        : never
    }
    const filtered = typedKeysOf(rsc).reduce((acc, cur) => {
      if (Predicate.isObject(rsc[cur]) && rsc[cur].Request) {
        acc[cur as keyof Filtered] = rsc[cur]
      }
      return acc
    }, {} as Filtered)

    const matchWithServices = <Key extends keyof Filtered>(action: Key) => {
      return <
        SVC extends Record<
          string,
          Effect<any, any, any>
        >,
        R2,
        E,
        A
      >(
        services: SVC,
        f: (
          req: S.Schema.Type<Rsc[Key]>,
          ctx: Compute<
            LowerServices<EffectDeps<SVC>> & GetRouteContext<Rsc[Key]>,
            "flat"
          >
        ) => Effect<A, E, R2>
      ) =>
      (req: any, ctx: any) =>
        Effect.andThen(allLower(services), (svc2) => f(req, { ...ctx, ...svc2, Response: rsc[action].Response }))
    }

    type MatchWithServicesNew<RT extends "raw" | "d", Key extends keyof Rsc> = {
      <R2, E, A>(
        f: Effect<A, E, R2>
      ): HandleVoid<
        GetSuccessShape<Rsc[Key], RT>,
        A,
        Handler<
          Rsc[Key],
          RT,
          A,
          E,
          R2,
          GetRouteContext<Rsc[Key]>
        >
      >

      <R2, E, A>(
        f: (
          req: S.Schema.Type<Rsc[Key]>,
          ctx: GetRouteContext<Rsc[Key]> & Pick<Rsc[Key], "Response">
        ) => Effect<A, E, R2>
      ): HandleVoid<
        GetSuccessShape<Rsc[Key], RT>,
        A,
        Handler<
          Rsc[Key],
          RT,
          A,
          E,
          R2,
          GetRouteContext<Rsc[Key]>
        >
      >

      <
        SVC extends Record<
          string,
          EffectUnunified<any, any, any>
        >,
        R2,
        E,
        A
      >(
        services: SVC,
        f: (
          req: S.Schema.Type<Rsc[Key]>,
          ctx: Compute<
            LowerServices<EffectDeps<SVC>> & GetRouteContext<Rsc[Key]> & Pick<Rsc[Key], "Response">,
            "flat"
          >
        ) => Effect<A, E, R2>
      ): HandleVoid<
        GetSuccessShape<Rsc[Key], RT>,
        A,
        Handler<
          Rsc[Key],
          RT,
          A,
          E,
          R2,
          GetRouteContext<Rsc[Key]>
        >
      >
    }

    type Keys = keyof Filtered

    const controllers = <
      THandlers extends {
        // import to keep them separate via | for type checking!!
        [K in Keys]: AHandler<Rsc[K]>
      }
    >(
      controllers: THandlers
    ) => {
      const handlers = typedKeysOf(filtered).reduce(
        (acc, cur) => {
          if (cur === "meta") return acc
          const m = (rsc as any).meta as { moduleName: string }
          if (!m) throw new Error("Resource has no meta specified")
          ;(acc as any)[cur] = handle(
            rsc[cur],
            m.moduleName + "." + (cur as string)
          )(controllers[cur as keyof typeof controllers] as any)
          return acc
        },
        {} as {
          [K in Keys]: ReqHandler<
            S.Schema.Type<Rsc[K]>,
            _R<ReturnType<THandlers[K]["handler"]>>,
            _E<ReturnType<THandlers[K]["handler"]>>,
            S.Schema.Type<GetSuccess<Rsc[K]>>, // TODO: GetSuccessShape, but requires RT
            Rsc[K],
            GetSuccess<Rsc[K]>,
            GetRouteContext<Rsc[K]>,
            GetEffectContext<Rsc[K]>
          >
        }
      )

      const mapped = typedKeysOf(handlers).reduce((acc, cur) => {
        const handler = handlers[cur]
        const req = handler.Request

        class Request extends (req as any) {
          static path = "/" + handler.name + (req.path === "/" ? "" : req.path)
          static method = req.method === "AUTO"
            ? REST.determineMethod(handler.name.split(".")[1]!, req)
            : req.method
        }
        if (req.method === "AUTO") {
          Object.assign(Request, {
            [Request.method === "GET" || Request.method === "DELETE" ? "Query" : "Body"]: req.Auto
          })
        }
        Object.assign(handler, { Request })
        acc[cur] = match(
          handler as any,
          errorHandler(req),
          handleRequestEnv // TODO
        )
        return acc
      }, {} as any) as {
        [K in Keys]: RouteMatch<
          _R<ReturnType<THandlers[K]["handler"]>>,
          Rsc[K],
          //        _E<ReturnType<THandlers[K]["handler"]>>,
          GetEffectContext<Rsc[K]>
        >
      }

      type _RRoute<T extends HttpRouter.Route<any, any>> = [T] extends [
        HttpRouter.Route<any, infer R>
      ] ? R
        : never

      type _ERoute<T extends HttpRouter.Route<any, any>> = [T] extends [
        HttpRouter.Route<infer E, any>
      ] ? E
        : never

      return HttpRouter.fromIterable(Object.values(mapped)) as HttpRouter.HttpRouter<
        _ERoute<typeof mapped[keyof typeof mapped]>,
        _RRoute<typeof mapped[keyof typeof mapped]>
      >
    }

    const r = {
      controllers,
      ...typedKeysOf(filtered).reduce(
        (prev, cur) => {
          ;(prev as any)[cur] = (svcOrFnOrEffect: any, fnOrNone: any) => {
            const stack = new Error().stack?.split("\n").slice(2).join("\n")
            return Effect.isEffect(svcOrFnOrEffect)
              ? class {
                static stack = stack
                static _tag = "d"
                static handler = () => svcOrFnOrEffect
              }
              : typeof svcOrFnOrEffect === "function"
              ? class {
                static stack = stack
                static _tag = "d"
                static handler = (req: any, ctx: any) => svcOrFnOrEffect(req, { ...ctx, Response: rsc[cur].Response })
              }
              : class {
                static stack = stack
                static _tag = "d"
                static handler = matchWithServices(cur)(svcOrFnOrEffect, fnOrNone)
              }
          }
          ;(prev as any)[(cur as any) + "Raw"] = (svcOrFnOrEffect: any, fnOrNone: any) => {
            const stack = new Error().stack?.split("\n").slice(2).join("\n")
            return Effect.isEffect(svcOrFnOrEffect)
              ? class {
                static stack = stack
                static _tag = "raw"
                static handler = () => svcOrFnOrEffect
              }
              : typeof svcOrFnOrEffect === "function"
              ? class {
                static stack = stack
                static _tag = "raw"
                static handler = (req: any, ctx: any) => svcOrFnOrEffect(req, { ...ctx, Response: rsc[cur].Response })
              }
              : class {
                static stack = stack
                static _tag = "raw"
                static handler = matchWithServices(cur)(svcOrFnOrEffect, fnOrNone)
              }
          }
          return prev
        },
        {} as
          & {
            // use Rsc as Key over using Keys, so that the Go To on X.Action remain in tact in Controllers files
            [Key in keyof Filtered]: MatchWithServicesNew<"d", Key>
          }
          & {
            // use Rsc as Key over using Keys, so that the Go To on X.Action remain in tact in Controllers files
            [Key in keyof Filtered as Key extends string ? `${Key}Raw` : never]: MatchWithServicesNew<"raw", Key>
          }
      )
    }
    return r
  }

  const errorHandler = (resourceRequest: { failure?: S.Schema.AnyNoContext }) => {
    return <R>(
      req: HttpServerRequest.HttpServerRequest,
      res: HttpServerResponse.HttpServerResponse,
      r2: Effect<HttpServerResponse.HttpServerResponse, SupportedErrors | JWTError | S.ParseResult.ParseError, R>
    ) => defaultErrorHandler(req, res, Effect.catchTag(r2, "ParseError", (_) => Effect.die(_)), resourceRequest.failure)
  }

  /**
   * Gather all handlers of a module and attach them to the Server.
   * If no `allowAnonymous` flag is on the Request, will require a valid authenticated user.
   */

  function matchAll<T extends RequestHandlersTest>(handlers: T) {
    const r = typedKeysOf(handlers).reduce((acc, cur) => {
      return HttpRouter.concat(acc, handlers[cur] as any)
    }, HttpRouter.empty)

    type _RRouter<T extends HttpRouter.HttpRouter<any, any>> = [T] extends [
      HttpRouter.HttpRouter<infer R, any>
    ] ? R
      : never

    type _ERouter<T extends HttpRouter.HttpRouter<any, any>> = [T] extends [
      HttpRouter.HttpRouter<any, infer E>
    ] ? E
      : never

    return r as HttpRouter.HttpRouter<
      _ERouter<typeof handlers[keyof typeof handlers]>,
      _RRouter<typeof handlers[keyof typeof handlers]>
    >
  }

  // type SupportedRequestHandler = RequestHandler<
  //   any,
  //   any,
  //   any,
  //   any,
  //   any,
  //   any,
  //   any,
  //   any,
  //   any,
  //   SupportedErrors | S.ParseResult.ParseError,
  //   any,
  //   any,
  //   any,
  //   any
  // >

  // type RequestHandlers = { [key: string]: SupportedRequestHandler }
  type RequestHandlersTest = {
    [key: string]: HttpRouter.HttpRouter<any, any>
  }

  return { matchFor, matchAll }
}
