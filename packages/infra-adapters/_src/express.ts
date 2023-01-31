/* eslint-disable @typescript-eslint/no-explicit-any */
// ets_tracing: off
// tracing: off

import type { NextHandleFunction } from "connect"
import type { NextFunction, Request, RequestHandler, Response } from "express"
import express from "express"
import type { IncomingMessage, Server, ServerResponse } from "http"
import type { Socket } from "net"

export type NonEmptyReadonlyArray<A> = ReadonlyArray<A> & {
  readonly 0: A
}
// export type _A<T extends Effect<any, any, any>> = [T] extends [
//   Effect<infer R, infer E, infer A>
// ]
//   ? A
//   : never

export type _R<T extends Effect<any, any, any>> = [T] extends [
  Effect<infer R, any, any>
] ? R
  : never

export type _E<T extends Effect<any, any, any>> = [T] extends [
  Effect<any, infer E, any>
] ? E
  : never

export class NodeServerCloseError {
  readonly _tag = "NodeServerCloseError"
  constructor(readonly error: Error) {}
}

export class NodeServerListenError {
  readonly _tag = "NodeServerListenError"
  constructor(readonly error: Error) {}
}

export const ExpressAppConfigTag = "@effect-app/express/AppConfig" as const

export interface ExpressAppConfig {
  readonly _tag: typeof ExpressAppConfigTag
  readonly port: number
  readonly host: string
  readonly exitHandler: typeof defaultExitHandler
}

export const ExpressAppConfig = Tag<ExpressAppConfig>()

export function LiveExpressAppConfig<R>(
  host: string,
  port: number,
  exitHandler: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => (cause: Cause<never>) => Effect<R, never, void>
) {
  return Effect.contextWith((r: Context<R>) => ({
    _tag: ExpressAppConfigTag,
    host,
    port,
    exitHandler: (
      req: Request,
      res: Response,
      next: NextFunction
    ) =>
    (cause: Cause<never>) => exitHandler(req, res, next)(cause).provideContext(r)
  })).toLayer(ExpressAppConfig)
}

export const ExpressAppTag = "@effect-app/express/App" as const

export const makeExpressApp = Effect.gen(function*(_) {
  // if scope closes, set open to false
  const open = yield* _(
    Ref.make(true)
      .acquireRelease(
        a => Effect(() => a.set(false))
      )
  )

  const app = yield* _(Effect(() => express()))

  const { exitHandler, host, port } = yield* _(ExpressAppConfig.access)

  const connections = new Set<Socket>()

  // if scope opens, create server, on scope close, close connections and server.
  const server = yield* _(
    Effect.async<never, never, Server>(cb => {
      const onError = (err: Error) => {
        cb(Effect.die(new NodeServerListenError(err)))
      }
      const server = app.listen(port, host, () => {
        cb(
          Effect(() => {
            server.removeListener("error", onError)
            return server
          })
        )
      })
      server.addListener("error", onError)
      server.on("connection", connection => {
        connections.add(connection)
        connection.on("close", () => {
          connections.delete(connection)
        })
      })
    }).acquireRelease(
      server =>
        Effect.async<never, never, void>(cb => {
          connections.forEach(s => {
            s.end()
            s.destroy()
          })
          server.close(err => {
            if (err) {
              cb(Effect.die(new NodeServerCloseError(err)))
            } else {
              cb(Effect.unit)
            }
          })
        })
    )
  )

  const supervisor = yield* _(
    Supervisor.track().acquireRelease(s => s.value().flatMap(_ => _.interruptAll))
  )

  function runtime<
    Handlers extends NonEmptyArguments<
      EffectRequestHandler<any, any, any, any, any, any>
    >
  >(handlers: Handlers) {
    type Env = _R<
      {
        [k in keyof Handlers]: [Handlers[k]] extends [
          EffectRequestHandler<infer R, any, any, any, any, any>
        ] ? Effect<R, never, void>
          : never
      }[number]
    >
    return Effect.runtime<Env>().map(r =>
      handlers.map(
        (handler): RequestHandler => (req, res, next) => {
          r.runCallback(
            open.get
              .flatMap(open => open ? handler(req, res, next) : Effect.interrupt())
              .onError(exitHandler(req, res, next))
              .supervised(supervisor)
          )
        }
      )
    )
  }

  return {
    _tag: ExpressAppTag,
    app,
    supervisor,
    server,
    runtime
  }
})

export interface ExpressApp extends Effect.Success<typeof makeExpressApp> {}
export const ExpressApp = Tag<ExpressApp>()
export const LiveExpressApp = makeExpressApp.toScopedLayer(ExpressApp)

export type ExpressEnv = ExpressAppConfig | ExpressApp

export function LiveExpress(host: string, port: number): Layer<never, never, ExpressEnv>
export function LiveExpress<R>(
  host: string,
  port: number,
  exitHandler: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => (cause: Cause<never>) => Effect<R, never, void>
): Layer<R, never, ExpressEnv>
export function LiveExpress<R>(
  host: string,
  port: number,
  exitHandler?: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => (cause: Cause<never>) => Effect<R, never, void>
): Layer<R, never, ExpressEnv> {
  return (
    LiveExpressAppConfig(host, port, exitHandler || defaultExitHandler) > LiveExpressApp
  )
}

export const expressApp = ExpressApp.accessWith(_ => _.app)

export const expressServer = ExpressApp.accessWith(_ => _.server)

export function withExpressApp<R, E, A>(self: (app: express.Express) => Effect<R, E, A>) {
  return ExpressApp.accessWithEffect(_ => self(_.app))
}
export function withExpressServer<R, E, A>(
  self: (server: Server<typeof IncomingMessage, typeof ServerResponse>) => Effect<R, E, A>
) {
  return ExpressApp.accessWithEffect(_ => self(_.server))
}

export const methods = [
  "all",
  "get",
  "post",
  "put",
  "delete",
  "patch",
  "options",
  "head",
  "checkout",
  "connect",
  "copy",
  "lock",
  "merge",
  "mkactivity",
  "mkcol",
  "move",
  "m-search",
  "notify",
  "propfind",
  "proppatch",
  "purge",
  "report",
  "search",
  "subscribe",
  "trace",
  "unlock",
  "unsubscribe"
] as const

export type Methods = typeof methods[number]

export type PathParams = string | RegExp | Array<string | RegExp>

export interface ParamsDictionary {
  [key: string]: string
}

export interface ParsedQs {
  [key: string]: undefined | string | string[] | ParsedQs | ParsedQs[]
}

export interface EffectRequestHandler<
  R,
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs,
  Locals extends Record<string, any> = Record<string, any>
> {
  (
    req: Request<P, ResBody, ReqBody, ReqQuery, Locals>,
    res: Response<ResBody, Locals>,
    next: NextFunction
  ): Effect<R, never, void>
}

export function expressRuntime<
  Handlers extends NonEmptyArguments<EffectRequestHandler<any, any, any, any, any, any>>
>(handlers: Handlers) {
  return ExpressApp.accessWithEffect(_ => _.runtime(handlers))
}

export function match(method: Methods): {
  <
    Handlers extends NonEmptyArguments<
      EffectRequestHandler<any, any, any, any, any, any>
    >
  >(
    path: PathParams,
    ...handlers: Handlers
  ): Effect<
    | ExpressEnv
    | _R<
      {
        [k in keyof Handlers]: [Handlers[k]] extends [
          EffectRequestHandler<infer R, any, any, any, any, any>
        ] ? Effect<R, never, void>
          : never
      }[number]
    >,
    never,
    void
  >
} {
  return function(path, ...handlers) {
    return expressRuntime(handlers).flatMap(expressHandlers =>
      withExpressApp(app =>
        Effect(() => {
          app[method](path, ...expressHandlers)
        })
      )
    )
  }
}

export function defaultExitHandler(
  _req: Request,
  res: Response,
  _next: NextFunction
): (cause: Cause<never>) => Effect<never, never, void> {
  return cause =>
    Effect(() => {
      if (cause.isDie()) {
        console.error(cause.pretty)
      }
      res.status(500).end()
    })
}

export function use<
  Handlers extends NonEmptyArguments<EffectRequestHandler<any, any, any, any, any, any>>
>(
  ...handlers: Handlers
): Effect<
  | ExpressEnv
  | _R<
    {
      [k in keyof Handlers]: [Handlers[k]] extends [
        EffectRequestHandler<infer R, any, any, any, any, any>
      ] ? Effect<R, never, void>
        : never
    }[number]
  >,
  never,
  void
>
export function use<
  Handlers extends NonEmptyArguments<EffectRequestHandler<any, any, any, any, any, any>>
>(
  path: PathParams,
  ...handlers: Handlers
): Effect<
  | ExpressEnv
  | _R<
    {
      [k in keyof Handlers]: [Handlers[k]] extends [
        EffectRequestHandler<infer R, any, any, any, any, any>
      ] ? Effect<R, never, void>
        : never
    }[number]
  >,
  never,
  void
>
export function use(...args: any[]) {
  return withExpressApp(app => {
    if (typeof args[0] === "function") {
      return expressRuntime(
        args as unknown as NonEmptyArguments<
          EffectRequestHandler<any, any, any, any, any, any>
        >
      ).flatMap(expressHandlers => Effect(() => app.use(...expressHandlers)))
    } else {
      return expressRuntime(
        args.slice(1) as unknown as NonEmptyArguments<
          EffectRequestHandler<any, any, any, any, any, any>
        >
      ).flatMap(expressHandlers => Effect(() => app.use(args[0], ...expressHandlers)))
    }
  })
}

export const all = match("all")
export const get = match("get")
export const post = match("post")
export const put = match("put")
const delete_ = match("delete")
export { delete_ as delete }
export const patch = match("patch")
export const options = match("options")
export const head = match("head")
export const checkout = match("checkout")
export const connect = match("connect")
export const copy = match("copy")
export const lock = match("lock")
export const merge = match("merge")
export const mkactivity = match("mkactivity")
export const mkcol = match("mkcol")
export const move = match("move")
export const mSearch = match("m-search")
export const notify = match("notify")
export const propfind = match("propfind")
export const proppatch = match("proppatch")
export const purge = match("purge")
export const report = match("report")
export const search = match("search")
export const subscribe = match("subscribe")
export const trace = match("trace")
export const unlock = match("unlock")
export const unsubscribe = match("unsubscribe")

/**
 * Lift an express requestHandler into an effectified variant
 */
export function classic(_: NextHandleFunction): EffectRequestHandler<never>
export function classic(_: RequestHandler): EffectRequestHandler<never>
export function classic(
  _: RequestHandler | NextHandleFunction
): EffectRequestHandler<never> {
  return (req, res, next) => Effect(() => _(req, res, next))
}

/**
 * The same as Effect.never, keeps the main fiber alive until interrupted
 */
export const listen = Effect.never
