/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Effect, flow, Predicate } from "@effect-app/core"
import type { Schema } from "effect-app/schema"
import { REST } from "effect-app/schema"
import { Path } from "path-parser"
import type { HttpClient } from "../http.js"
import { S } from "../lib.js"
import { typedKeysOf } from "../utils.js"
import type { ApiConfig } from "./config.js"
import type { SupportedErrors } from "./errors.js"
import type { FetchError, FetchResponse } from "./fetch.js"
import {
  fetchApi,
  fetchApi3S,
  fetchApi3SE,
  makePathWithBody,
  makePathWithQuery,
  mapResponseM,
  ResError
} from "./fetch.js"

export * from "./config.js"

type Requests = Record<string, any>
type AnyRequest =
  & Omit<
    REST.QueryRequest<any, any, any, any, any, any>,
    "method"
  >
  & REST.RequestSchemed<any, any>

const cache = new Map<any, Client<any>>()

export type Client<M extends Requests> =
  & RequestHandlers<
    ApiConfig | HttpClient.HttpClient.Service,
    SupportedErrors | FetchError | ResError,
    M
  >
  & RequestHandlersE<
    ApiConfig | HttpClient.HttpClient.Service,
    SupportedErrors | FetchError | ResError,
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
  type Filtered = {
    [K in keyof Requests as Requests[K] extends { Response: any } ? K : never]: Requests[K] extends { Response: any }
      ? Requests[K]
      : never
  }
  const filtered = typedKeysOf(models).reduce((acc, cur) => {
    if (
      Predicate.isObject(models[cur])
      && (models[cur].Request || Object.keys(models[cur]).some((_) => _.endsWith("Request")) /* bwc */)
    ) {
      acc[cur as keyof Filtered] = models[cur]
    }
    return acc
  }, {} as Filtered)
  return (typedKeysOf(filtered)
    // ignore module interop with automatic default exports..
    .filter((x) => x !== "default" && x !== "meta")
    .reduce((prev, cur) => {
      const h = filtered[cur]

      const Request_ = REST.extractRequest(h) as AnyRequest
      const Response = REST.extractResponse(h)

      const m = (models as any).meta as { moduleName: string }
      if (!m) throw new Error("No meta defined in Resource!")
      const requestName = `${m.moduleName}.${cur as string}`
        .replaceAll(".js", "")

      const Request = class extends (Request_ as any) {
        static path = "/" + requestName + (Request_.path === "/" ? "" : Request_.path)
        static method = Request_.method as REST.SupportedMethods === "AUTO"
          ? REST.determineMethod(cur as string, Request_)
          : Request_.method
      } as unknown as AnyRequest

      if ((Request_ as any).method === "AUTO") {
        Object.assign(Request, {
          [Request.method === "GET" || Request.method === "DELETE" ? "Query" : "Body"]: (Request_ as any).Auto
        })
      }

      const b = Object.assign({}, h, { Request, Response })

      const meta = {
        Request,
        Response,
        mapPath: Request.path,
        name: requestName
      }

      const res = Response as Schema<any>
      const parseResponse = flow(S.decodeUnknown(res), (_) => Effect.mapError(_, (err) => new ResError(err)))
      const parseResponseE = flow(
        S.decodeUnknown(S.encodedSchema(res)),
        (_) => Effect.mapError(_, (err) => new ResError(err))
      )

      const path = new Path(Request.path)
      const parse = mapResponseM(parseResponse)
      const parseE = mapResponseM(parseResponseE)

      // TODO: look into ast, look for propertySignatures, etc.
      // TODO: and fix type wise
      // if we don't need fields, then also dont require an argument.
      const fields = [Request.Body, Request.Query, Request.Path]
        .filter((x) => x)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        .flatMap((x) => x.ast.propertySignatures)
      // @ts-expect-error doc
      prev[cur] = Request.method === "GET"
        ? fields.length === 0
          ? {
            handler: fetchApi(Request.method, Request.path, undefined, Request.errors)
              .pipe(
                Effect.flatMap(parse),
                Effect
                  .withSpan("client.request " + requestName, {
                    attributes: { "request.name": requestName }
                  })
              ),
            ...meta
          }
          : {
            handler: (req: any) =>
              fetchApi(Request.method, makePathWithQuery(path, S.encodeSync(Request)(req)), undefined, Request.errors)
                .pipe(
                  Effect.flatMap(parse),
                  Effect
                    .withSpan("client.request " + requestName, {
                      attributes: { "request.name": requestName }
                    })
                ),
            ...meta,
            mapPath: (req: any) => req ? makePathWithQuery(path, S.encodeSync(Request)(req)) : Request.path
          }
        : fields.length === 0
        ? {
          handler: fetchApi3S(b)({}).pipe(Effect.withSpan("client.request " + requestName, {
            attributes: { "request.name": requestName }
          })),
          ...meta
        }
        : {
          handler: (req: any) =>
            fetchApi3S(b)(req).pipe(Effect.withSpan("client.request " + requestName, {
              attributes: { "request.name": requestName }
            })),

          ...meta,
          mapPath: (req: any) =>
            req
              ? Request.method === "DELETE"
                ? makePathWithQuery(path, S.encodeSync(Request)(req))
                : makePathWithBody(path, S.encodeSync(Request)(req))
              : Request.path
        }

      // generate handler

      // @ts-expect-error doc
      prev[`${cur}E`] = Request.method === "GET"
        ? fields.length === 0
          ? {
            handler: fetchApi(Request.method, Request.path)
              .pipe(
                Effect.flatMap(parseE),
                Effect
                  .withSpan("client.request " + requestName, {
                    attributes: { "request.name": requestName }
                  })
              ),
            ...meta
          }
          : {
            handler: (req: any) =>
              fetchApi(Request.method, makePathWithQuery(path, S.encodeSync(Request)(req)))
                .pipe(
                  Effect.flatMap(parseE),
                  Effect
                    .withSpan("client.request " + requestName, {
                      attributes: { "request.name": requestName }
                    })
                ),

            ...meta,
            mapPath: (req: any) => req ? makePathWithQuery(path, S.encodeSync(Request)(req)) : Request.path
          }
        : fields.length === 0
        ? {
          handler: fetchApi3SE(b)({}).pipe(Effect.withSpan("client.request " + requestName, {
            attributes: { "request.name": requestName }
          })),
          ...meta
        }
        : {
          handler: (req: any) =>
            fetchApi3SE(b)(req).pipe(Effect.withSpan("client.request " + requestName, {
              attributes: { "request.name": requestName }
            })),

          ...meta,
          mapPath: (req: any) =>
            req
              ? Request.method === "DELETE"
                ? makePathWithQuery(path, S.encodeSync(Request)(req))
                : makePathWithBody(path, S.encodeSync(Request)(req))
              : Request.path
        }
      // generate handler

      return prev
    }, {} as Client<M>))
}

export type ExtractResponse<T> = T extends Schema<any, any, any> ? Schema.Type<T>
  : T extends unknown ? void
  : never

export type ExtractEResponse<T> = T extends Schema<any, any, any> ? Schema.Encoded<T>
  : T extends unknown ? void
  : never

type HasEmptyTo<T extends Schema<any, any, any>> = keyof Schema.Type<T> extends never ? true
  : false

// TODO: refactor to new Request pattern, then filter out non-requests similar to the runtime changes in clientFor, and matchFor (boilerplate)
type RequestHandlers<R, E, M extends Requests> = {
  [K in keyof M]: HasEmptyTo<REST.GetRequest<M[K]>> extends true ? {
      handler: Effect<FetchResponse<ExtractResponse<REST.GetResponse<M[K]>>>, E, R>
      Request: REST.GetRequest<M[K]>
      Reponse: ExtractResponse<REST.GetResponse<M[K]>>
      mapPath: string
      name: string
    }
    : {
      handler: (
        req: InstanceType<REST.GetRequest<M[K]>>
      ) => Effect<
        FetchResponse<ExtractResponse<REST.GetResponse<M[K]>>>,
        E,
        R
      >
      Request: REST.GetRequest<M[K]>
      Reponse: ExtractResponse<REST.GetResponse<M[K]>>
      mapPath: (req: InstanceType<REST.GetRequest<M[K]>>) => string
      name: string
    }
}

type RequestHandlersE<R, E, M extends Requests> = {
  [K in keyof M & string as `${K}E`]: HasEmptyTo<REST.GetRequest<M[K]>> extends true ? {
      handler: Effect<
        FetchResponse<ExtractEResponse<REST.GetResponse<M[K]>>>,
        E,
        R
      >
      Request: REST.GetRequest<M[K]>
      Reponse: ExtractResponse<REST.GetResponse<M[K]>>
      mapPath: string
      name: string
    }
    : {
      handler: (
        req: InstanceType<REST.GetRequest<M[K]>>
      ) => Effect<
        FetchResponse<ExtractEResponse<REST.GetResponse<M[K]>>>,
        E,
        R
      >
      Request: REST.GetRequest<M[K]>
      Reponse: ExtractResponse<REST.GetResponse<M[K]>>
      mapPath: (req: InstanceType<REST.GetRequest<M[K]>>) => string
      name: string
    }
}
