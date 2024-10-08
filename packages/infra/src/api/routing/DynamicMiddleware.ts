/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Rpc } from "@effect/rpc"
import type { Effect, Request, S } from "effect-app"
import type { GetEffectContext, RPCContextMap } from "effect-app/client/req"
import type * as EffectRequest from "effect/Request"

export interface Middleware<Context, CTXMap extends Record<string, RPCContextMap.Any>> {
  contextMap: CTXMap
  context: Context
  execute: <
    T extends {
      config?: { [K in keyof CTXMap]?: any }
    },
    Req extends S.TaggedRequest.All,
    R
  >(
    schema: T & S.Schema<Req, any, never>,
    handler: (
      request: Req
    ) => Effect.Effect<EffectRequest.Request.Success<Req>, EffectRequest.Request.Error<Req>, R>,
    moduleName?: string
  ) => (
    req: Req
  ) => Effect.Effect<
    Request.Request.Success<Req>,
    Request.Request.Error<Req>,
    any // smd
  >
}

export const makeRpc = <Context, CTXMap extends Record<string, RPCContextMap.Any>>(
  middleware: Middleware<Context, CTXMap>
) => {
  return {
    effect: <T extends { config?: { [K in keyof CTXMap]?: any } }, Req extends S.TaggedRequest.All, R>(
      schema: T & S.Schema<Req, any, never>,
      handler: (
        request: Req
      ) => Effect.Effect<
        EffectRequest.Request.Success<Req>,
        EffectRequest.Request.Error<Req>,
        R
      >,
      moduleName?: string
    ) => {
      return Rpc.effect<Req, Context | Exclude<R, GetEffectContext<CTXMap, T["config"]>>>(
        schema,
        middleware.execute(schema, handler, moduleName)
      )
    }
  }
}
