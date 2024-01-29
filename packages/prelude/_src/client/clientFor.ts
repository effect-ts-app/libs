/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { REST } from "@effect-app/prelude/schema"
import * as utils from "@effect-app/prelude/utils"
import { Path } from "path-parser"
import type { ApiConfig } from "./config.js"
import type { FetchError, FetchResponse } from "./fetch.js"
import {
  fetchApi,
  fetchApi3S,
  fetchApi3SE,
  makePathWithBody,
  makePathWithQuery,
  mapResponseM,
  ResponseError
} from "./fetch.js"

export * from "./config.js"

type Requests = Record<string, any>
type AnyRequest =
  & Omit<
    REST.QueryRequest<any, any, any, any, any, any>,
    "method"
  >
  & {
    method: REST.Methods.Rest
  }
  & REST.RequestSchemed<any, any>

const cache = new Map<any, Client<any>>()

export type Client<M extends Requests> =
  & RequestHandlers<
    ApiConfig | HttpClient.Default,
    FetchError | ResponseError,
    M
  >
  & RequestHandlersE<
    ApiConfig | HttpClient.Default,
    FetchError | ResponseError,
    M
  >

export function clientFor<M extends Requests>(
  models: M
): Client<Omit<M, "meta">> {
  const found = cache.get(models)
  if (found) {
    return found
  }
  const m = clientFor_(models)
  cache.set(models, m)
  return m
}

function clientFor_<M extends Requests>(models: M) {
  return (
    models
      .$$
      .keys
      // ignore module interop with automatic default exports..
      .filter((x) => x !== "default" && x !== "meta")
      .reduce((prev, cur) => {
        const h = models[cur]

        const Request_ = REST.extractRequest(h) as AnyRequest
        const Response = REST.extractResponse(h)

        // @ts-expect-error doc
        const actionName = utils.uncapitalize(cur)
        const m = (models as any).meta as { moduleName: string }
        if (!m) throw new Error("No meta defined in Resource!")
        const requestName = `${m.moduleName}.${cur as string}`
          .replaceAll(".js", "")

        const Request = class extends (Request_ as any) {
          static path = "/" + requestName + (Request_.path === "/" ? "" : Request_.path)
        } as unknown as AnyRequest

        const b = Object.assign({}, h, { Request, Response })

        const meta = {
          Request,
          Response,
          mapPath: Request.path
        }

        const wm = new WeakMap()

        const cstri = (a: any) => new (Request as any)(a) // TODO

        // we need to have the same constructed value for fetch aswell as mapPath
        const cstr = (req: any) => {
          const e = wm.get(req)
          if (e) return e
          const v = cstri(req)
          wm.set(req, v)
          return v
        }

        const res = Response as Schema<never, any, any>
        const parseResponse = flow(res.decodeUnknown, (_) => _.mapError((err) => new ResponseError(err)))

        const parseResponseE = flow(parseResponse, (x) => x.andThen(res.encode))

        const path = new Path(Request.path)

        // TODO: look into ast, look for propertySignatures, etc.
        // TODO: and fix type wise
        // if we don't need fields, then also dont require an argument.
        const fields = [Request.Body, Request.Query, Request.Path]
          .filter((x) => x)
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          .flatMap((x) => x.ast.propertySignatures)
        // @ts-expect-error doc
        prev[actionName] = Request.method === "GET"
          ? fields.length === 0
            ? Object.assign(
              fetchApi(Request.method, Request.path)
                .flatMap(mapResponseM(parseResponse))
                .withSpan("client.request", {
                  attributes: { "request.name": requestName }
                }),
              meta
            )
            : Object.assign(
              (req: any) =>
                fetchApi(Request.method, makePathWithQuery(path, Request.encodeSync(cstr(req))))
                  .flatMap(mapResponseM(parseResponse))
                  .withSpan("client.request", {
                    attributes: { "request.name": requestName }
                  }),
              {
                ...meta,
                mapPath: (req: any) => req ? makePathWithQuery(path, Request.encodeSync(cstr(req))) : Request.path
              }
            )
          : fields.length === 0
          ? Object.assign(
            fetchApi3S(b)({}).withSpan("client.request", {
              attributes: { "request.name": requestName }
            }),
            meta
          )
          : Object.assign(
            (req: any) =>
              fetchApi3S(b)(cstr(req)).withSpan("client.request", {
                attributes: { "request.name": requestName }
              }),
            {
              ...meta,
              mapPath: (req: any) =>
                req
                  ? Request.method === "DELETE"
                    ? makePathWithQuery(path, Request.encodeSync(cstr(req)))
                    : makePathWithBody(path, Request.encodeSync(cstr(req)))
                  : Request.path
            }
          )
        // generate handler

        // @ts-expect-error doc
        prev[`${actionName}E`] = Request.method === "GET"
          ? fields.length === 0
            ? Object.assign(
              fetchApi(Request.method, Request.path)
                .flatMap(mapResponseM(parseResponseE))
                .withSpan("client.request", {
                  attributes: { "request.name": requestName }
                }),
              meta
            )
            : Object.assign(
              (req: any) =>
                fetchApi(Request.method, makePathWithQuery(path, Request.encodeSync(cstr(req))))
                  .flatMap(mapResponseM(parseResponseE))
                  .withSpan("client.request", {
                    attributes: { "request.name": requestName }
                  }),
              {
                ...meta,
                mapPath: (req: any) => req ? makePathWithQuery(path, Request.encodeSync(cstr(req))) : Request.path
              }
            )
          : fields.length === 0
          ? Object.assign(
            fetchApi3SE(b)({}).withSpan("client.request", {
              attributes: { "request.name": requestName }
            }),
            meta
          )
          : Object.assign(
            (req: any) =>
              fetchApi3SE(b)(cstr(req)).withSpan("client.request", {
                attributes: { "request.name": requestName }
              }),
            {
              ...meta,
              mapPath: (req: any) =>
                req
                  ? Request.method === "DELETE"
                    ? makePathWithQuery(path, Request.encodeSync(cstr(req)))
                    : makePathWithBody(path, Request.encodeSync(cstr(req)))
                  : Request.path
            }
          ) // generate handler

        return prev
      }, {} as Client<M>)
  )
}

export type ExtractResponse<T> = T extends Schema<any, any> ? Schema.To<T>
  : T extends unknown ? void
  : never

export type ExtractEResponse<T> = T extends Schema<any, any> ? Schema.From<T>
  : T extends unknown ? void
  : never

type HasEmptyTo<T extends Schema<any, any>> = T extends { struct: Schema<any, any> }
  ? Schema.To<T["struct"]> extends Record<any, never> ? true : Schema.To<T> extends Record<any, never> ? true : false
  : false

type RequestHandlers<R, E, M extends Requests> = {
  [K in keyof M & string as Uncapitalize<K>]: HasEmptyTo<REST.GetRequest<M[K]>> extends true
    ? Effect<R, E, FetchResponse<ExtractResponse<REST.GetResponse<M[K]>>>> & {
      Request: REST.GetRequest<M[K]>
      Reponse: ExtractResponse<REST.GetResponse<M[K]>>
      mapPath: string
    }
    :
      & ((
        req: ConstructorParameters<REST.GetRequest<M[K]>>[0]
      ) => Effect<
        R,
        E,
        FetchResponse<ExtractResponse<REST.GetResponse<M[K]>>>
      >)
      & {
        Request: REST.GetRequest<M[K]>
        Reponse: ExtractResponse<REST.GetResponse<M[K]>>
        // we use a weakmap as cache for converting constructor input to constructed.
        mapPath: (
          req?: ConstructorParameters<REST.GetRequest<M[K]>>[0]
        ) => string
      }
}

type RequestHandlersE<R, E, M extends Requests> = {
  [K in keyof M & string as `${Uncapitalize<K>}E`]: HasEmptyTo<REST.GetRequest<M[K]>> extends true ?
      & Effect<
        R,
        E,
        FetchResponse<ExtractEResponse<REST.GetResponse<M[K]>>>
      >
      & {
        Request: REST.GetRequest<M[K]>
        Reponse: ExtractResponse<REST.GetResponse<M[K]>>
        mapPath: string
      }
    :
      & ((
        req: ConstructorParameters<REST.GetRequest<M[K]>>[0]
      ) => Effect<
        R,
        E,
        FetchResponse<ExtractEResponse<REST.GetResponse<M[K]>>>
      >)
      & {
        Request: REST.GetRequest<M[K]>
        Reponse: ExtractResponse<REST.GetResponse<M[K]>>
        // we use a weakmap as cache for converting constructor input to constructed.
        mapPath: (
          req?: ConstructorParameters<REST.GetRequest<M[K]>>[0]
        ) => string
      }
}
