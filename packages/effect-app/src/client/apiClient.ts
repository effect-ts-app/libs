/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Schema } from "../internal/lib.js"
import { Config, Context, Effect, flow, HashMap, Layer, Option, Predicate, S, Struct } from "../internal/lib.js"

import type { Rpc } from "@effect/rpc"
import { RpcResolver } from "@effect/rpc"
import { HttpRpcResolver } from "@effect/rpc-http"
import type { RpcRouter } from "@effect/rpc/RpcRouter"
import { HttpClient, HttpClientRequest } from "../http.js"
import { typedKeysOf } from "../utils.js"
import type { Client, Requests } from "./clientFor.js"

export interface ApiConfig {
  url: string
  headers: Option<HashMap<string, string>>
}

export const DefaultApiConfig = Config.all({
  url: Config.string("apiUrl").pipe(Config.withDefault("/api")),
  headers: Config
    .hashMap(
      Config.string(),
      "headers"
    )
    .pipe(Config.option)
})

type Req = S.Schema.All & {
  new(...args: any[]): any
  _tag: string
  fields: S.Struct.Fields
  success: S.Schema.Any
  failure: S.Schema.Any
  config?: Record<string, any>
}

const apiClient = (config: ApiConfig) =>
  Effect.gen(function*() {
    const baseClient = yield* HttpClient.HttpClient
    const client = baseClient.pipe(
      HttpClient.mapRequest(HttpClientRequest.prependUrl(config.url + "/rpc")),
      HttpClient.mapRequest(
        HttpClientRequest.setHeaders(config.headers.pipe(Option.getOrElse(() => HashMap.empty())))
      )
    )

    const clientFor_ = <M extends Requests>(models: M, requestLevelLayers = Layer.empty) => {
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

      const baseClient = HttpClient.mapRequest(client, HttpClientRequest.appendUrl("/" + meta.moduleName))

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

          const client: <Req extends Schema.TaggedRequest.All>(request: Req) => Rpc.Rpc.Result<Req, unknown> =
            baseClient
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
    }

    function makeFor(requestLevelLayers: Layer.Layer<never, never, never>) {
      const cache = new Map<any, Client<any>>()

      return <M extends Requests>(
        models: M
      ): Client<Omit<M, "meta">> => {
        const found = cache.get(models)
        if (found) {
          return found
        }
        const m = clientFor_(models, requestLevelLayers)
        cache.set(models, m)
        return m
      }
    }

    return { for_: clientFor_, makeFor_: makeFor }
  })

export class ApiClient extends Context.TagId("ApiClient")<ApiClient, Effect.Success<ReturnType<typeof apiClient>>>() {
  static readonly layer = (apiConfig: ApiConfig) => this.toLayer(apiClient(apiConfig))
  static readonly layerFromConfig = DefaultApiConfig.pipe(Effect.map(this.layer), Layer.unwrapEffect)

  static readonly makeFor = (requestLevelLayers: Layer.Layer<never, never, never>) => <M extends Requests>(models: M) =>
    this.use((_) => _.makeFor_(requestLevelLayers)).pipe(Effect.map((_) => _(models)))
}
