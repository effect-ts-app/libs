/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Rpc } from "@effect/rpc"
import { RpcResolver } from "@effect/rpc"
import { HttpRpcResolver } from "@effect/rpc-http"
import type { RpcRouter } from "@effect/rpc/RpcRouter"
import { HttpClient, HttpClientRequest } from "effect-app/http"
import { typedKeysOf } from "effect-app/utils"
import type * as Request from "effect/Request"
import type { Path } from "path-parser"
import qs from "query-string"
import type { Schema } from "../internal/lib.js"
import { Effect, flow, Layer, Predicate, Record, Struct } from "../internal/lib.js"
import * as S from "../Schema.js"
import { ApiClient } from "./apiClient.js"

export function makePathWithQuery(
  path: Path,
  pars: Record<
    string,
    | string
    | number
    | boolean
    | readonly string[]
    | readonly number[]
    | readonly boolean[]
    | null
  >
) {
  const forQs = Record.filter(pars, (_, k) => !path.params.includes(k))
  const q = forQs // { ...forQs, _: JSON.stringify(forQs) } // TODO: drop completely individual keys from query?, sticking to json only
  return (
    path.build(pars, { ignoreSearch: true, ignoreConstraints: true })
    + (Object.keys(q).length
      ? "?" + qs.stringify(q)
      : "")
  )
}

export function makePathWithBody(
  path: Path,
  pars: Record<
    string,
    | string
    | number
    | boolean
    | readonly string[]
    | readonly number[]
    | readonly boolean[]
    | null
  >
) {
  return path.build(pars, { ignoreSearch: true, ignoreConstraints: true })
}

type Requests = Record<string, any>

export type Client<M extends Requests> = RequestHandlers<
  never,
  never,
  M
>

export function makeClientFor(requestLevelLayers: Layer.Layer<never, never, never>) {
  const cache = new Map<any, Client<any>>()

  return <M extends Requests>(
    models: M
  ): Effect<Client<Omit<M, "meta">>, never, ApiClient> =>
    Effect.gen(function*() {
      const found = cache.get(models)
      if (found) {
        return found
      }
      const m = yield* clientFor_(models, requestLevelLayers)
      cache.set(models, m)
      return m
    })
}

type Req = S.Schema.All & {
  new(...args: any[]): any
  _tag: string
  fields: S.Struct.Fields
  success: S.Schema.Any
  failure: S.Schema.Any
  config?: Record<string, any>
}

const clientFor_ = <M extends Requests>(models: M, requestLevelLayers = Layer.empty) =>
  Effect.gen(function*() {
    type Filtered = {
      [K in keyof Requests as Requests[K] extends Req ? K : never]: Requests[K] extends Req ? Requests[K] : never
    }
    // TODO: Record.filter
    const filtered = typedKeysOf(models).reduce((acc, cur) => {
      if (
        Predicate.isObject(models[cur])
        && (models[cur].success)
      ) {
        acc[cur as keyof Filtered] = models[cur]
      }
      return acc
    }, {} as Record<keyof Filtered, Req>)

    const meta = (models as any).meta as { moduleName: string }
    if (!meta) throw new Error("No meta defined in Resource!")

    const resolver = flow(
      HttpRpcResolver.make<RpcRouter<any, any>>,
      (_) => RpcResolver.toClient(_ as any)
    )

    const baseClient = yield* ApiClient.pipe(
      Effect.andThen((_) => HttpClient.mapRequest(_.client, HttpClientRequest.appendUrl("/" + meta.moduleName)))
    )

    return (typedKeysOf(filtered)
      .reduce((prev, cur) => {
        const h = filtered[cur]!

        const Request = h
        const Response = h.success

        const requestName = `${meta.moduleName}.${cur as string}`
          .replaceAll(".js", "")

        const requestMeta = {
          Request,
          name: requestName
        }

        const client: <Req extends Schema.TaggedRequest.All>(request: Req) => Rpc.Rpc.Result<Req, unknown> = baseClient
          .pipe(
            HttpClient.mapRequest(HttpClientRequest.appendUrlParam("action", cur as string)),
            resolver
          )

        const fields = Struct.omit(Request.fields, "_tag")
        // @ts-expect-error doc
        prev[cur] = Object.keys(fields).length === 0
          ? {
            handler: client(new Request() as Schema.TaggedRequest.All).pipe(
              Effect.withSpan("client.request " + requestName, {
                captureStackTrace: false,
                attributes: { "request.name": requestName }
              }),
              Effect.provide(requestLevelLayers)
            ),
            ...requestMeta,
            raw: {
              handler: client(new Request() as Schema.TaggedRequest.All).pipe(
                Effect.flatMap((res) => S.encode(Response)(res)), // TODO,
                Effect.withSpan("client.request " + requestName, {
                  captureStackTrace: false,
                  attributes: { "request.name": requestName }
                }),
                Effect.provide(requestLevelLayers)
              ),
              ...requestMeta
            }
          }
          : {
            handler: (req: any) =>
              client(new Request(req) as Schema.TaggedRequest.All).pipe(
                Effect.withSpan("client.request " + requestName, {
                  captureStackTrace: false,
                  attributes: { "request.name": requestName }
                }),
                Effect.provide(requestLevelLayers)
              ),

            ...requestMeta,
            raw: {
              handler: (req: any) =>
                client(new Request(req) as Schema.TaggedRequest.All).pipe(
                  Effect.flatMap((res) => S.encode(Response)(res)), // TODO,
                  Effect.withSpan("client.request " + requestName, {
                    captureStackTrace: false,
                    attributes: { "request.name": requestName }
                  }),
                  Effect.provide(requestLevelLayers)
                ),

              ...requestMeta
            }
          }

        return prev
      }, {} as Client<M>))
  })

export type ExtractResponse<T> = T extends Schema<any, any, any> ? Schema.Type<T>
  : T extends unknown ? void
  : never

export type ExtractEResponse<T> = T extends Schema<any, any, any> ? Schema.Encoded<T>
  : T extends unknown ? void
  : never

type IsEmpty<T> = keyof T extends never ? true
  : false

type Cruft = "_tag" | Request.RequestTypeId | typeof Schema.symbolSerializable | typeof Schema.symbolWithResult

export type TaggedRequestClassAny = S.Schema.Any & {
  readonly _tag: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly success: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly failure: any
}

export interface RequestHandler<A, E, R, Request extends TaggedRequestClassAny> {
  handler: Effect<A, E, R>
  name: string
  Request: Request
}

export interface RequestHandlerWithInput<I, A, E, R, Request extends TaggedRequestClassAny> {
  handler: (i: I) => Effect<A, E, R>
  name: string
  Request: Request
}

type RequestHandlers<R, E, M extends Requests> = {
  [K in keyof M]: IsEmpty<Omit<S.Schema.Type<M[K]>, Cruft>> extends true
    ? RequestHandler<Schema.Type<M[K]["success"]>, Schema.Schema.Type<M[K]["failure"]> | E, R, M[K]> & {
      raw: RequestHandler<Schema.Type<M[K]["success"]>, Schema.Schema.Type<M[K]["failure"]> | E, R, M[K]>
    }
    :
      & RequestHandlerWithInput<
        Omit<S.Schema.Type<M[K]>, Cruft>,
        Schema.Schema.Type<M[K]["success"]>,
        Schema.Schema.Type<M[K]["failure"]> | E,
        R,
        M[K]
      >
      & {
        raw: RequestHandlerWithInput<
          Omit<S.Schema.Type<M[K]>, Cruft>,
          Schema.Schema.Encoded<M[K]["success"]>,
          Schema.Schema.Type<M[K]["failure"]> | E,
          R,
          M[K]
        >
      }
}
