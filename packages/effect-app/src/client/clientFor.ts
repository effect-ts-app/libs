/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { RpcResolver } from "@effect/rpc"
import { HttpRpcResolver } from "@effect/rpc-http"
import type { RpcRouter } from "@effect/rpc/RpcRouter"
import { Record } from "effect"
import { HttpBody, HttpClient, HttpClientRequest } from "effect-app/http"
import { typedKeysOf } from "effect-app/utils"
import type * as Request from "effect/Request"
import type { Path } from "path-parser"
import qs from "query-string"
import type { Schema } from "../internal/lib.js"
import { Chunk, Effect, flow, HashMap, Layer, Option, Predicate, Stream, Struct } from "../internal/lib.js"
import * as S from "../Schema.js"
import { ApiConfig } from "./config.js"

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

const apiClient = Effect.gen(function*() {
  const client = yield* HttpClient.HttpClient
  const config = yield* ApiConfig.Tag
  return client.pipe(
    HttpClient.mapRequest(HttpClientRequest.prependUrl(config.apiUrl + "/rpc")),
    HttpClient.mapRequest(
      HttpClientRequest.setHeaders(config.headers.pipe(Option.getOrElse(() => HashMap.empty())))
    )
  )
})

export type Client<M extends Requests> = RequestHandlers<
  ApiConfig | HttpClient.HttpClient,
  never, // SupportedErrors | FetchError | ResError,
  M
>

export function makeClientFor(layers: Layer.Layer<never, never, never>) {
  const cache = new Map<any, Client<any>>()

  return <M extends Requests>(
    models: M
  ): Client<Omit<M, "meta">> => {
    const found = cache.get(models)
    if (found) {
      return found
    }
    const m = clientFor_(models, layers)
    cache.set(models, m)
    return m
  }
}

type Req = S.Schema.All & {
  new(...args: any[]): any
  _tag: string
  fields: S.Struct.Fields
  success: S.Schema.Any
  failure: S.Schema.Any
  config?: Record<string, any>
}

const get = ["Get", "Index", "List", "All", "Find", "Search"]
const del = ["Delete", "Remove", "Destroy"]
const patch = ["Patch", "Update", "Edit"]

const astAssignableToString = (ast: S.AST.AST): boolean => {
  if (ast._tag === "StringKeyword") return true
  if (ast._tag === "Union" && ast.types.every(astAssignableToString)) {
    return true
  }
  if (ast._tag === "Refinement" || ast._tag === "Transformation") {
    return astAssignableToString(ast.from)
  }

  return false
}

const onlyStringsAst = (ast: S.AST.AST): boolean => {
  if (ast._tag === "Union") return ast.types.every(onlyStringsAst)
  if (ast._tag !== "TypeLiteral") return false
  return ast.propertySignatures.every((_) => astAssignableToString(_.type))
}

const onlyStrings = (schema: S.Schema<any, any, any> & { fields?: S.Struct.Fields }): boolean => {
  if ("fields" in schema && schema.fields) return onlyStringsAst(S.Struct(schema.fields).ast) // only one level..
  return onlyStringsAst(schema.ast)
}

export const determineMethod = (actionName: string, schema: S.Schema.All) => {
  if (get.some((_) => actionName.startsWith(_))) return onlyStrings(schema) ? "GET" as const : "POST" as const
  if (del.some((_) => actionName.startsWith(_))) return onlyStrings(schema) ? "DELETE" as const : "POST" as const
  if (patch.some((_) => actionName.startsWith(_))) return "PATCH" as const
  return "POST" as const
}

function clientFor_<M extends Requests>(models: M, layers = Layer.empty) {
  type Filtered = {
    [K in keyof Requests as Requests[K] extends Req ? K : never]: Requests[K] extends Req ? Requests[K] : never
  }
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

  const baseClient = apiClient.pipe(
    Effect.andThen(HttpClient.mapRequest(HttpClientRequest.appendUrl("/" + meta.moduleName)))
  )

  return (typedKeysOf(filtered)
    .reduce((prev, cur) => {
      const h = filtered[cur]!

      const Request = h
      const Response = h.success

      const requestName = `${meta.moduleName}.${cur as string}`
        .replaceAll(".js", "")

      const requestMeta = {
        method: determineMethod(Request._tag, Request),
        Request,
        name: requestName
      }

      // TODO: make this determine method
      const make = <R extends RpcRouter<any, any>>(
        client: HttpClient.HttpClient
      ) =>
        RpcResolver.make((requests) =>
          client
            .post("", {
              body: HttpBody.unsafeJson(requests)
            })
            .pipe(
              Effect.map((_) =>
                _.stream.pipe(
                  Stream.decodeText(),
                  Stream.splitLines,
                  Stream.map((_) => Chunk.unsafeFromArray(JSON.parse(_) as any[])),
                  Stream.flattenChunks
                )
              ),
              Stream.unwrapScoped
            )
        )<R>()

      // TODO: swap method based on request
      const client = <A extends Req>(req: A) =>
        baseClient.pipe(
          Effect.andThen(
            flow(
              HttpClient.mapRequest(HttpClientRequest.appendUrlParam("action", cur as string)),
              HttpClient.mapRequest(HttpClientRequest.setMethod(determineMethod(req._tag, req)))
            )
          ),
          Effect.andThen(resolver)
        )

      const fields = Struct.omit(Request.fields, "_tag")
      // @ts-expect-error doc
      prev[cur] = Object.keys(fields).length === 0
        ? {
          handler: client(new Request())
            .pipe(
              Effect.withSpan("client.request " + requestName, {
                captureStackTrace: false,
                attributes: { "request.name": requestName }
              }),
              Effect.provide(layers)
            ),
          ...requestMeta,
          raw: {
            handler: client(new Request()).pipe(
              Effect.flatMap((res) => S.encode(Response)(res)), // TODO,
              Effect.withSpan("client.request " + requestName, {
                captureStackTrace: false,
                attributes: { "request.name": requestName }
              }),
              Effect.provide(layers)
            ),
            ...requestMeta
          }
        }
        : {
          handler: (req: any) =>
            client(new Request(req)).pipe(
              Effect.withSpan("client.request " + requestName, {
                captureStackTrace: false,
                attributes: { "request.name": requestName }
              }),
              Effect.provide(layers)
            ),

          ...requestMeta,
          raw: {
            handler: (req: any) =>
              client(new Request(req)).pipe(
                Effect.flatMap((res) => S.encode(Response)(res)), // TODO,
                Effect.withSpan("client.request " + requestName, {
                  captureStackTrace: false,
                  attributes: { "request.name": requestName }
                }),
                Effect.provide(layers)
              ),

            ...requestMeta
          }
        }

      return prev
    }, {} as Client<M>))
}

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
