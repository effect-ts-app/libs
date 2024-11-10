/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { makeMiddleware, makeRouter } from "@effect-app/infra/api/routing7"
import type { RequestContext } from "@effect-app/infra/RequestContext"
import { Rpc } from "@effect/rpc"
import type { Request } from "effect-app"
import { Context, Effect, FiberRef, Layer, S, Schedule } from "effect-app"
import { type GetEffectContext, makeRpcClient, type RPCContextMap, UnauthorizedError } from "effect-app/client"
import { HttpHeaders, HttpServerRequest } from "effect-app/http"
import type * as EffectRequest from "effect/Request"
import { it } from "vitest"

const optimisticConcurrencySchedule = Schedule.once
  && Schedule.recurWhile<any>((a) => a?._tag === "OptimisticConcurrencyException")

export interface CTX {
  context: RequestContext
}

export type CTXMap = {
  // allowAnonymous: RPCContextMap.Inverted<"userProfile", UserProfile, typeof NotLoggedInError>
  // TODO: not boolean but `string[]`
  requireRoles: RPCContextMap.Custom<"", never, typeof UnauthorizedError, Array<string>>
}
const middleware = makeMiddleware({
  contextMap: null as unknown as CTXMap,
  // helper to deal with nested generic lmitations
  context: null as any as HttpServerRequest.HttpServerRequest,
  execute: Effect.gen(function*() {
    return <T extends { config?: { [K in keyof CTXMap]?: any } }, Req extends S.TaggedRequest.All, R>(
      _schema: T & S.Schema<Req, any, never>,
      handler: (request: Req) => Effect.Effect<EffectRequest.Request.Success<Req>, EffectRequest.Request.Error<Req>, R>,
      moduleName?: string
    ) =>
    (
      req: Req
    ): Effect.Effect<
      Request.Request.Success<Req>,
      Request.Request.Error<Req>,
      | HttpServerRequest.HttpServerRequest
      | Exclude<R, GetEffectContext<CTXMap, T["config"]>>
    > =>
      Effect
        .gen(function*() {
          // const headers = yield* Rpc.currentHeaders
          const ctx = Context.empty()

          // const config = "config" in schema ? schema.config : undefined

          // Check JWT
          // TODO
          // if (!fakeLogin && !request.allowAnonymous) {
          //   yield* Effect.catchAll(
          //     checkJWTI({
          //       ...authConfig,
          //       issuer: authConfig.issuer + "/",
          //       jwksUri: `${authConfig.issuer}/.well-known/jwks.json`
          //     }),
          //     (err) => Effect.fail(new JWTError({ error: err }))
          //   )
          // }

          // const fakeLogin = true
          // const r = (fakeLogin
          //   ? makeUserProfileFromUserHeader(headers["x-user"])
          //   : makeUserProfileFromAuthorizationHeader(
          //     headers["authorization"]
          //   ))
          //   .pipe(Effect.exit, basicRuntime.runSync)
          // if (!Exit.isSuccess(r)) {
          //   yield* Effect.logWarning("Parsing userInfo failed").pipe(Effect.annotateLogs("r", r))
          // }
          // const userProfile = Option.fromNullable(Exit.isSuccess(r) ? r.value : undefined)
          // if (Option.isSome(userProfile)) {
          //   // yield* rcc.update((_) => ({ ..._, userPorfile: userProfile.value }))
          //   ctx = ctx.pipe(Context.add(UserProfile, userProfile.value))
          // } else if (!config?.allowAnonymous) {
          //   return yield* new NotLoggedInError({ message: "no auth" })
          // }

          // if (config?.requireRoles) {
          //   // TODO
          //   if (
          //     !userProfile.value
          //     || !config.requireRoles.every((role: any) => userProfile.value!.roles.includes(role))
          //   ) {
          //     return yield* new UnauthorizedError()
          //   }
          // }

          return yield* handler(req).pipe(
            Effect.retry(optimisticConcurrencySchedule),
            Effect.provide(ctx as Context.Context<GetEffectContext<CTXMap, T["config"]>>)
          )
        })
        .pipe(
          Effect.provide(
            Effect
              .gen(function*() {
                yield* Effect.annotateCurrentSpan("request.name", moduleName ? `${moduleName}.${req._tag}` : req._tag)
                // yield* RequestContextContainer.update((_) => ({
                //   ..._,
                //   name: NonEmptyString255(moduleName ? `${moduleName}.${req._tag}` : req._tag)
                // }))
                const httpReq = yield* HttpServerRequest.HttpServerRequest
                // TODO: only pass Authentication etc, or move headers to actual Rpc Headers
                yield* FiberRef.update(
                  Rpc.currentHeaders,
                  (headers) =>
                    HttpHeaders.merge(
                      httpReq.headers,
                      headers
                    )
                )
              })
              .pipe(Layer.effectDiscard)
          )
        )
    // .pipe(Effect.provide(RequestCacheLayers)) as any
  })
})

export const { Router, matchAll, matchFor } = makeRouter(middleware, true)

export type RequestConfig = {
  /** Disable authentication requirement */
  allowAnonymous?: true
  /** Control the roles that are required to access the resource */
  allowRoles?: readonly string[]
}
export const { TaggedRequest: Req } = makeRpcClient<RequestConfig, CTXMap>({
  // allowAnonymous: NotLoggedInError,
  requireRoles: UnauthorizedError
})

export class DoSomething extends Req<DoSomething>()("DoSomething", {
  id: S.String
}, { success: S.Void }) {}

export class GetSomething extends Req<GetSomething>()("GetSomething", {
  id: S.String
}, { success: S.String }) {}

export class GetSomething2 extends Req<GetSomething2>()("GetSomething2", {
  id: S.String
}, { success: S.NumberFromString }) {}

const Something = { DoSomething, GetSomething, GetSomething2, meta: { moduleName: "Something" as const } }

export class SomethingService extends Effect.Service<SomethingService>()("SomethingService", {
  dependencies: [],
  effect: Effect.gen(function*() {
    return {}
  })
}) {}

declare const a: {
  (opt: { a: 1 }): void
  (opt: { a: 2 }): void
  (opt: { b: 3 }): void
  (opt: { b: 3 }): void
}

export class SomethingRepo extends Effect.Service<SomethingRepo>()("SomethingRepo", {
  dependencies: [SomethingService.Default],
  effect: Effect.gen(function*() {
    const smth = yield* SomethingService
    console.log({ smth })
    return {}
  })
}) {}

export class SomethingService2 extends Effect.Service<SomethingService2>()("SomethingService2", {
  dependencies: [],
  effect: Effect.gen(function*() {
    return {}
  })
}) {}

it("router6", () => {
  const routes = Router(Something)({
    dependencies: [
      SomethingRepo.Default,
      SomethingService.Default,
      SomethingService2.Default
    ],
    effect: Effect.gen(function*() {
      const repo = yield* SomethingRepo
      const smth = yield* SomethingService
      const smth2 = yield* SomethingService2

      console.log({ repo, smth, smth2 })

      return matchFor(Something)({
        DoSomething: Effect.void,
        GetSomething: Effect.succeed("12"),
        GetSomething2: Effect.succeed(12)
      })
    })
  })
  console.log({ routes })
})

export default Router(Something)({
  dependencies: [
    SomethingRepo.Default,
    SomethingService.Default,
    SomethingService2.Default
  ],
  effect: Effect.gen(function*() {
    const repo = yield* SomethingRepo
    const smth = yield* SomethingService
    const smth2 = yield* SomethingService2

    console.log({ repo, smth, smth2 })

    return matchFor(Something)({
      GetSomething: Effect.succeed("12"),
      DoSomething: Effect.succeed(2), // Effect.succeed(2) should fail
      GetSomething2: Effect.succeed(12)
    })
  })
})

export const RawTest = Router(Something)({
  dependencies: [
    SomethingRepo.Default,
    SomethingService.Default,
    SomethingService2.Default
  ],
  effect: Effect.gen(function*() {
    const repo = yield* SomethingRepo
    const smth = yield* SomethingService
    const smth2 = yield* SomethingService2

    console.log({ repo, smth, smth2 })

    return matchFor(Something)({
      GetSomething: Effect.succeed("12"),
      DoSomething: { raw: Effect.succeed(1) }, // Effect.succeed(2) should fail
      GetSomething2: { raw: Effect.succeed("12") }
    })
  })
})
