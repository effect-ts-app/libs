/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
/*
TODO: Effect.retry(r2, optimisticConcurrencySchedule) / was for PATCH only
TODO: uninteruptible commands! was for All except GET.
*/
import { allLower, type EffectUnunified, type LowerServices } from "@effect-app/core/Effect"
import { typedKeysOf } from "@effect-app/core/utils"
import type { Compute } from "@effect-app/core/utils"
import type * as HttpApp from "@effect/platform/HttpApp"
import type { Rpc } from "@effect/rpc"
import { RpcRouter } from "@effect/rpc"
import type { S } from "effect-app"
import { Chunk, Context, Effect, FiberRef, Predicate, Stream } from "effect-app"
import type { GetEffectContext, RPCContextMap } from "effect-app/client/req"
import type { HttpServerError } from "effect-app/http"
import { HttpRouter, HttpServerRequest, HttpServerResponse } from "effect-app/http"
import type { Middleware } from "./routing/DynamicMiddleware.js"
import { makeRpc } from "./routing/DynamicMiddleware.js"

export type _R<T extends Effect<any, any, any>> = [T] extends [
  Effect<any, any, infer R>
] ? R
  : never

export type _E<T extends Effect<any, any, any>> = [T] extends [
  Effect<any, infer E, any>
] ? E
  : never

export type EffectDeps<A> = {
  [K in keyof A as A[K] extends Effect<any, any, any> ? K : never]: A[K] extends Effect<any, any, any> ? A[K] : never
}
/**
 *   Plain jane JSON version
 * @deprecated use HttpRpcRouterNoStream.toHttpApp once support options
 */
export const toHttpApp = <R extends RpcRouter.RpcRouter<any, any>>(self: R, options?: {
  readonly spanPrefix?: string
}): HttpApp.Default<
  HttpServerError.RequestError,
  RpcRouter.RpcRouter.Context<R>
> => {
  const handler = RpcRouter.toHandler(self, options)
  return Effect.withFiberRuntime((fiber) => {
    const context = fiber.getFiberRef(FiberRef.currentContext)
    const request = Context.unsafeGet(context, HttpServerRequest.HttpServerRequest)
    return Effect.flatMap(
      request.json,
      (_) =>
        handler(_).pipe(
          Stream.provideContext(context),
          Stream.runCollect,
          Effect.map((_) => Chunk.toReadonlyArray(_)),
          Effect.andThen((_) => HttpServerResponse.json(_)),
          Effect.orDie
        )
    )
  })
}

type GetRouteContext<CTXMap extends Record<string, RPCContextMap.Any>, T> =
  // & CTX
  // inverted
  & {
    [
      key in keyof CTXMap as CTXMap[key][3] extends true ? never
        : key extends keyof T ? T[key] extends true ? CTXMap[key][0] : never
        : never
    ]?: CTXMap[key][1]
  }
  & {
    [
      key in keyof CTXMap as CTXMap[key][3] extends true ? never
        : key extends keyof T ? T[key] extends false ? CTXMap[key][0] : never
        : CTXMap[key][0]
    ]: CTXMap[key][1]
  }
  // normal
  & {
    [
      key in keyof CTXMap as CTXMap[key][3] extends false ? never
        : key extends keyof T ? T[key] extends true ? CTXMap[key][0] : never
        : never
    ]: CTXMap[key][1]
  }
  & {
    [
      key in keyof CTXMap as CTXMap[key][3] extends false ? never
        : key extends keyof T ? T[key] extends false ? CTXMap[key][0] : never
        : CTXMap[key][0]
    ]?: CTXMap[key][1]
  }

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

// Separate "raw" vs "d" to verify A (Encoded for "raw" vs Type for "d")
type AHandler<Action extends AnyRequestModule> =
  | Handler<
    Action,
    "raw",
    S.Schema.Encoded<GetSuccess<Action>>,
    S.Schema.Type<GetFailure<Action>> | S.ParseResult.ParseError,
    any,
    { Response: any }
  >
  | Handler<
    Action,
    "d",
    S.Schema.Type<GetSuccess<Action>>,
    S.Schema.Type<GetFailure<Action>> | S.ParseResult.ParseError,
    any,
    { Response: any }
  >

type Filter<T> = {
  [K in keyof T as T[K] extends S.Schema.All & { success: S.Schema.Any; failure: S.Schema.Any } ? K : never]: T[K]
}

interface ExtendedMiddleware<Context, CTXMap extends Record<string, RPCContextMap.Any>>
  extends Middleware<Context, CTXMap>
{
  // TODO
  makeContext: Effect<
    { [K in keyof CTXMap as CTXMap[K][1] extends never ? never : CTXMap[K][0]]: CTXMap[K][1] },
    never,
    never
  >
}

export const makeRouter = <Context, CTXMap extends Record<string, RPCContextMap.Any>>(
  middleware: ExtendedMiddleware<Context, CTXMap>
) => {
  const rpc = makeRpc(middleware)
  function matchFor<Rsc extends Record<string, any> & { meta: { moduleName: string } }>(
    rsc: Rsc
  ) {
    const meta = (rsc as any).meta as { moduleName: string }
    if (!meta) throw new Error("Resource has no meta specified") // TODO: do something with moduleName+cur etc.

    type Filtered = Filter<Rsc>
    const filtered = typedKeysOf(rsc).reduce((acc, cur) => {
      if (Predicate.isObject(rsc[cur]) && rsc[cur]["success"]) {
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
            LowerServices<EffectDeps<SVC>> & GetRouteContext<CTXMap, Rsc[Key]["config"]> & {
              Response: Rsc[Key]["success"]
            },
            "flat"
          >
        ) => Effect<A, E, R2>
      ) =>
      (req: any) =>
        Effect.andThen(
          Effect.all({ svc: allLower(services), ctx: middleware.makeContext }),
          ({ ctx, svc }) => f(req, { ...svc, ...ctx, Response: rsc[action].success } as any)
        )
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
          Exclude<R2, GetEffectContext<CTXMap, Rsc[Key]["config"]>>,
          { Response: Rsc[Key]["success"] } //
        >
      >

      <R2, E, A>(
        f: (
          req: S.Schema.Type<Rsc[Key]>,
          ctx: GetRouteContext<CTXMap, Rsc[Key]["config"]> & { Response: Rsc[Key]["success"] }
        ) => Effect<A, E, R2>
      ): HandleVoid<
        GetSuccessShape<Rsc[Key], RT>,
        A,
        Handler<
          Rsc[Key],
          RT,
          A,
          E,
          Exclude<R2, GetEffectContext<CTXMap, Rsc[Key]["config"]>>,
          { Response: Rsc[Key]["success"] } //
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
            LowerServices<EffectDeps<SVC>> & GetRouteContext<CTXMap, Rsc[Key]["config"]> & {
              Response: Rsc[Key]["success"]
            },
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
          Exclude<R2, GetEffectContext<CTXMap, Rsc[Key]["config"]>>,
          { Response: Rsc[Key]["success"] } //
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
          ;(acc as any)[cur] = {
            h: controllers[cur as keyof typeof controllers].handler,
            Request: rsc[cur]
          }

          return acc
        },
        {} as {
          [K in Keys]: {
            h: (
              r: S.Schema.Type<Rsc[K]>
            ) => Effect<
              S.Schema.Type<GetSuccess<Rsc[K]>>,
              _E<ReturnType<THandlers[K]["handler"]>>,
              _R<ReturnType<THandlers[K]["handler"]>>
            >
            Request: Rsc[K]
          }
        }
      )

      const mapped = typedKeysOf(handlers).reduce((acc, cur) => {
        const handler = handlers[cur]
        const req = handler.Request

        acc[cur] = rpc.effect(req, handler.h as any, meta.moduleName) // TODO
        return acc
      }, {} as any) as {
        [K in Keys]: Rpc.Rpc<
          Rsc[K],
          _R<ReturnType<THandlers[K]["handler"]>>
        >
      }

      type RPCRouteR<T extends Rpc.Rpc<any, any>> = [T] extends [
        Rpc.Rpc<any, infer R>
      ] ? R
        : never

      type RPCRouteReq<T extends Rpc.Rpc<any, any>> = [T] extends [
        Rpc.Rpc<infer Req, any>
      ] ? Req
        : never

      const router = RpcRouter.make(...Object.values(mapped) as any) as RpcRouter.RpcRouter<
        RPCRouteReq<typeof mapped[keyof typeof mapped]>,
        RPCRouteR<typeof mapped[keyof typeof mapped]>
      >

      return HttpRouter.empty.pipe(
        HttpRouter.all(
          ("/rpc/" + rsc.meta.moduleName) as any,
          toHttpApp(router, { spanPrefix: rsc.meta.moduleName + "." }),
          // TODO: not queries.
          { uninterruptible: true }
        )
      )
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
                static handler = (req: any) =>
                  Effect.andThen(
                    Effect.all({ ctx: middleware.makeContext }),
                    ({ ctx }) => svcOrFnOrEffect(req, { ...ctx, Response: rsc[cur].success })
                  )
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
                static handler = (req: any, ctx: any) => svcOrFnOrEffect(req, { ...ctx, Response: rsc[cur].success })
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
            /**
             * Requires the Type shape
             */
            [Key in keyof Filtered]: MatchWithServicesNew<"d", Key>
          }
          & {
            // use Rsc as Key over using Keys, so that the Go To on X.Action remain in tact in Controllers files
            /**
             * Requires the Encoded shape (e.g directly undecoded from DB, so that we don't do multiple Decode/Encode)
             */
            [Key in keyof Filtered as Key extends string ? `${Key}Raw` : never]: MatchWithServicesNew<"raw", Key>
          }
      )
    }
    return r
  }

  type RequestHandlersTest = {
    [key: string]: HttpRouter.HttpRouter<any, any>
  }
  function matchAll<T extends RequestHandlersTest>(handlers: T) {
    const r = typedKeysOf(handlers).reduce((acc, cur) => {
      return HttpRouter.concat(acc, handlers[cur] as any)
    }, HttpRouter.empty)

    type _RRouter<T extends HttpRouter.HttpRouter<any, any>> = [T] extends [
      HttpRouter.HttpRouter<any, infer R>
    ] ? R
      : never

    type _ERouter<T extends HttpRouter.HttpRouter<any, any>> = [T] extends [
      HttpRouter.HttpRouter<infer E, any>
    ] ? E
      : never

    return r as HttpRouter.HttpRouter<
      _ERouter<typeof handlers[keyof typeof handlers]>,
      _RRouter<typeof handlers[keyof typeof handlers]>
    >
  }

  return { matchAll, matchFor }
}
