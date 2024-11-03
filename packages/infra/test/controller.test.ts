/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Rpc } from "@effect/rpc"
import type { Request } from "effect-app"
import { Context, Effect, FiberRef, Layer, S, Schedule } from "effect-app"
import { type GetEffectContext, makeRpcClient, type RPCContextMap, UnauthorizedError } from "effect-app/client"
import { HttpHeaders, HttpServerRequest } from "effect-app/http"
import type * as EffectRequest from "effect/Request"
import { makeMiddleware, makeRouter } from "../src/api/routing.js"
import type { RequestContext } from "../src/RequestContext.js"

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

export const { matchAll, matchFor } = makeRouter(middleware, true)

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

export class GetSomething extends Req<GetSomething>()("GetSomething", {
  id: S.String
}, { success: S.Void }) {}

const Something = { GetSomething, meta: { moduleName: "Something" as const } }

export class SomethingRepo extends Effect.Service<SomethingRepo>()("SomethingRepo", {
  dependencies: [],
  effect: Effect.gen(function*() {
    return {}
  })
}) {}

matchFor(Something)([], ({ GetSomething }) =>
  Effect.gen(function*() {
    // const repo = yield* SomethingRepo
    return { GetSomething: GetSomething(Effect.void) }
  }))
