/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */

import type { GetResponse, Methods, QueryRequest, RequestSchemed } from "@effect-ts-app/boilerplate-prelude/schema"
import { condemnCustom } from "@effect-ts-app/boilerplate-prelude/schema"
import * as utils from "@effect-ts-app/boilerplate-prelude/utils"
import type * as H from "@effect-ts-app/core/http/http-client"
import { Path } from "path-parser"

import type { ApiConfig } from "./config.js"
import type { FetchError, FetchResponse, ResponseError } from "./fetch.js"
import {
  fetchApi,
  fetchApi3S,
  fetchApi3SE,
  makePathWithBody,
  makePathWithQuery,
  mapResponseErrorS,
  mapResponseM
} from "./fetch.js"

export * from "./config.js"

type Requests = Record<string, Record<string, any>>
type AnyRequest = Omit<QueryRequest<any, any, any, any, any>, "method"> & {
  method: Methods
} & RequestSchemed<any, any>

const cache = new Map<any, Client<any>>()

export type Client<M extends Requests> =
  & RequestHandlers<ApiConfig | H.Http, FetchError | ResponseError, M>
  & RequestHandlersE<ApiConfig | H.Http, FetchError | ResponseError, M>

export function clientFor<M extends Requests>(models: M): Client<M> {
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
    models.$$.keys
      // ignore module interop with automatic default exports..
      .filter(x => x !== "default")
      .reduce(
        (prev, cur) => {
          const h = models[cur]

          const Request = Schema.extractRequest(h) as AnyRequest
          const Response = Schema.extractResponse(h)

          const b = Object.assign({}, h, { Request, Response })

          const meta = {
            Request,
            Response,
            mapPath: Request.path
          }

          const parseResponse = flow(
            Schema.Parser.for(Response)["|>"](condemnCustom),
            mapResponseErrorS
          )

          const parseResponseE = flow(parseResponse, x => x.map(Schema.Encoder.for(Response)))

          const path = new Path(Request.path)

          // if we don't need props, then also dont require an argument.
          const props = [Request.Body, Request.Query, Request.Path]
            .filter(x => x)
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            .flatMap(x => Object.keys(x.Api.props))
          // @ts-expect-error doc
          prev[utils.uncapitalize(cur)] = Request.method === "GET"
            ? props.length === 0
              ? Object.assign(
                fetchApi(Request.method, Request.path).flatMap(
                  mapResponseM(parseResponse)
                ),
                meta
              )
              : Object.assign(
                (req: any) =>
                  fetchApi(Request.method, makePathWithQuery(path, req)).flatMap(
                    mapResponseM(parseResponse)
                  ),
                {
                  ...meta,
                  mapPath: (req: any) => req ? makePathWithQuery(path, req) : Request.path
                }
              )
            : props.length === 0
            ? Object.assign(fetchApi3S(b)({}), meta)
            : Object.assign((req: any) => fetchApi3S(b)(req), {
              ...meta,
              mapPath: (req: any) =>
                req
                  ? Request.method === "DELETE"
                    ? makePathWithQuery(path, req)
                    : makePathWithBody(path, req)
                  : Request.path
            }) // generate handler

          // @ts-expect-error doc
          prev[`${utils.uncapitalize(cur)}E`] = Request.method === "GET"
            ? props.length === 0
              ? Object.assign(
                fetchApi(Request.method, Request.path).flatMap(
                  mapResponseM(parseResponseE)
                ),
                meta
              )
              : Object.assign(
                (req: any) =>
                  fetchApi(Request.method, makePathWithQuery(path, req)).flatMap(
                    mapResponseM(parseResponseE)
                  ),
                {
                  ...meta,
                  mapPath: (req: any) => req ? makePathWithQuery(path, req) : Request.path
                }
              )
            : props.length === 0
            ? Object.assign(fetchApi3SE(b)({}), meta)
            : Object.assign((req: any) => fetchApi3SE(b)(req), {
              ...meta,
              mapPath: (req: any) =>
                req
                  ? Request.method === "DELETE"
                    ? makePathWithQuery(path, req)
                    : makePathWithBody(path, req)
                  : Request.path
            }) // generate handler

          return prev
        },
        {} as Client<M>
      )
  )
}

export type ExtractResponse<T> = T extends { Model: Schema.SchemaAny } ? ParsedShapeOfCustom<T["Model"]>
  : T extends Schema.SchemaAny ? ParsedShapeOfCustom<T>
  : T extends unknown ? Schema.Void
  : never

export type ExtractEResponse<T> = T extends { Model: Schema.SchemaAny } ? EncodedOf<T["Model"]>
  : T extends Schema.SchemaAny ? EncodedOf<T>
  : T extends unknown ? Schema.Void
  : never

type RequestHandlers<R, E, M extends Requests> = {
  [K in keyof M & string as Uncapitalize<K>]: keyof Schema.GetRequest<
    M[K]
  >[Schema.schemaField]["Api"]["props"] extends never
    ? Effect<R, E, FetchResponse<ExtractResponse<GetResponse<M[K]>>>> & {
      Request: Schema.GetRequest<M[K]>
      Reponse: ExtractResponse<GetResponse<M[K]>>
      mapPath: string
    }
    : 
      & ((
        req: InstanceType<Schema.GetRequest<M[K]>>
      ) => Effect<R, E, FetchResponse<ExtractResponse<GetResponse<M[K]>>>>)
      & {
        Request: Schema.GetRequest<M[K]>
        Reponse: ExtractResponse<GetResponse<M[K]>>
        mapPath: (req?: InstanceType<Schema.GetRequest<M[K]>>) => string
      }
}

type RequestHandlersE<R, E, M extends Requests> = {
  [K in keyof M & string as `${Uncapitalize<K>}E`]: keyof Schema.GetRequest<
    M[K]
  >[Schema.schemaField]["Api"]["props"] extends never
    ? Effect<R, E, FetchResponse<ExtractEResponse<GetResponse<M[K]>>>> & {
      Request: Schema.GetRequest<M[K]>
      Reponse: ExtractResponse<GetResponse<M[K]>>
      mapPath: string
    }
    : 
      & ((
        req: InstanceType<Schema.GetRequest<M[K]>>
      ) => Effect<R, E, FetchResponse<ExtractEResponse<GetResponse<M[K]>>>>)
      & {
        Request: Schema.GetRequest<M[K]>
        Reponse: ExtractResponse<GetResponse<M[K]>>
        mapPath: (req?: InstanceType<Schema.GetRequest<M[K]>>) => string
      }
}
