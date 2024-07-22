/* eslint-disable @typescript-eslint/no-explicit-any */
import { Effect, HashMap, Option } from "@effect-app/core"
import { constant } from "@effect-app/core/Function"
import type { Headers, HttpError, HttpRequestError, HttpResponseError, Method } from "@effect-app/core/http/http-client"
import { Record } from "effect"
import type { REST, Schema } from "effect-app/schema"
import { StringId } from "effect-app/schema"
import { Path } from "path-parser"
import qs from "query-string"
import { ApiConfig } from "./config.js"
import type { SupportedErrors } from "./errors.js"
import {
  InvalidStateError,
  NotFoundError,
  NotLoggedInError,
  OptimisticConcurrencyException,
  ServiceUnavailableError,
  UnauthorizedError,
  ValidationError
} from "./errors.js"

import type { ResponseError } from "@effect/platform/HttpClientError"
import { HttpClient, HttpClientRequest } from "../http.js"
import { S } from "../lib.js"

export type FetchError = HttpError<string>

export class ResError {
  public readonly _tag = "ResponseError"
  constructor(public readonly error: unknown) {}
}

const getClient = Effect.flatMap(
  HttpClient.HttpClient,
  (defaultClient) =>
    Effect.map(ApiConfig.Tag, ({ apiUrl, headers }) =>
      defaultClient
        .pipe(
          HttpClient.filterStatusOk,
          HttpClient
            .mapRequest((_) =>
              _.pipe(
                HttpClientRequest.acceptJson,
                HttpClientRequest.prependUrl(apiUrl),
                HttpClientRequest
                  .setHeaders({
                    "request-id": Option.getOrUndefined(Option.flatMap(headers, (_) => HashMap.get(_, "request-id")))
                      ?? StringId.make(),
                    ...Option.getOrUndefined(Option.map(headers, (_) => Object.fromEntries(_)))
                  })
              )
            ),
          HttpClient
            .tapRequest((r) =>
              Effect
                .logDebug(`[HTTP] ${r.method}`)
                .pipe(Effect.annotateLogs({
                  "url": r.url,
                  "body": r.body._tag === "Uint8Array"
                    ? new TextDecoder().decode(r.body.body)
                    : r.body._tag,
                  "headers": r.headers
                }))
            ),
          HttpClient
            .mapEffect((_) =>
              (_.status === 204
                ? Effect.sync(() => ({ status: _.status, body: void 0, headers: _.headers }))
                : Effect.map(_.json, (body) => ({ status: _.status, body, headers: _.headers })))
                .pipe(Effect.withSpan("client.response"))
            ),
          HttpClient
            .catchTag(
              "ResponseError",
              (err): Effect<FetchResponse<unknown>, ResponseError | SupportedErrors> => {
                const toError = <R, From, To>(s: Schema<To, From, R>) =>
                  Effect
                    .flatMap(
                      err
                        .response
                        .json,
                      (_) => S.decodeUnknown(s)(_).pipe(Effect.catchAll(() => Effect.fail(err)))
                    )
                    .pipe(Effect.flatMap(Effect.fail))

                // opposite of api's `defaultErrorHandler`
                if (err.response.status === 404) {
                  return toError(NotFoundError)
                }
                if (err.response.status === 400) {
                  return toError(ValidationError)
                }
                if (err.response.status === 401) {
                  return toError(NotLoggedInError)
                }
                if (err.response.status === 422) {
                  return toError(InvalidStateError)
                }
                if (err.response.status === 503) {
                  return toError(ServiceUnavailableError)
                }
                if (err.response.status === 403) {
                  return toError(UnauthorizedError)
                }
                if (err.response.status === 412) {
                  return toError(OptimisticConcurrencyException)
                }
                return Effect.fail(err)
              }
            ),
          HttpClient.catchTags({
            "ResponseError": (err) =>
              Effect
                .orDie(
                  err
                    .response
                    .text
                  // TODO
                )
                .pipe(Effect
                  .flatMap((_) =>
                    Effect.fail({
                      _tag: "HttpErrorResponse" as const,
                      response: {
                        body: Option.fromNullable(_),
                        status: err.response.status,
                        headers: err.response.headers
                      }
                    } as HttpResponseError<unknown>)
                  )),
            "RequestError": (err) => Effect.fail({ _tag: "HttpErrorRequest", error: err.cause } as HttpRequestError)
          })
        ))
)

export function fetchApi(
  method: Method,
  path: string,
  body?: unknown
) {
  return Effect.flatMap(getClient, (client) =>
    (method === "GET"
      ? client(HttpClientRequest.make(method)(path))
      : body === undefined
      ? client(HttpClientRequest.make(method)(path))
      : HttpClientRequest
        .make(method)(path)
        .pipe(HttpClientRequest.jsonBody(body), Effect.flatMap(client)))
      .pipe(Effect.scoped))
}

export function fetchApi2S<RequestR, RequestFrom, RequestTo, ResponseR, ResponseFrom, ResponseTo>(
  request: Schema<RequestTo, RequestFrom, RequestR>,
  response: Schema<ResponseTo, ResponseFrom, ResponseR>
) {
  const encodeRequest = S.encode(request)
  const decRes = S.decodeUnknown(response)
  const decodeRes = (u: unknown) => Effect.mapError(decRes(u), (err) => new ResError(err))
  const parse = mapResponseM(decodeRes)
  return (method: Method, path: Path) => (req: RequestTo) => {
    return Effect.andThen(encodeRequest(req), (encoded) =>
      fetchApi(
        method,
        method === "DELETE"
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          ? makePathWithQuery(path, encoded as any)
          : makePathWithBody(path, encoded as any),
        encoded
      )
        .pipe(Effect.flatMap(parse)))
  }
}

export function fetchApi3S<RequestA, RequestE, ResponseE = unknown, ResponseA = void>({
  Request,
  Response
}: {
  // eslint-disable-next-line @typescript-eslint/ban-types
  Request: REST.RequestSchemed<RequestA, RequestE>
  // eslint-disable-next-line @typescript-eslint/ban-types
  Response: REST.ReqRes<ResponseA, ResponseE, any>
}) {
  return fetchApi2S(Request, Response)(
    Request.method,
    new Path(Request.path)
  )
}

export function fetchApi3SE<RequestA, RequestE, ResponseE = unknown, ResponseA = void>({
  Request,
  Response
}: {
  // eslint-disable-next-line @typescript-eslint/ban-types
  Request: REST.RequestSchemed<RequestA, RequestE>
  // eslint-disable-next-line @typescript-eslint/ban-types
  Response: REST.ReqRes<ResponseA, ResponseE, any>
}) {
  const a = fetchApi2S(Request, Response)(
    Request.method,
    new Path(Request.path)
  )
  const parse = mapResponseM(S.encode(Response))
  return (req: RequestA) => Effect.flatMap(a(req), parse)
}

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

export function mapResponse<T, A>(map: (t: T) => A) {
  return (r: FetchResponse<T>): FetchResponse<A> => {
    return { ...r, body: map(r.body) }
  }
}

export function mapResponseM<T, R, E, A>(map: (t: T) => Effect<A, E, R>) {
  return (r: FetchResponse<T>): Effect<FetchResponse<A>, E, R> => {
    return Effect
      .all({
        body: map(r.body),
        headers: Effect.sync(() => r.headers),
        status: Effect.sync(() => r.status)
      })
      .pipe(Effect.withSpan("client.decode"))
  }
}
export type FetchResponse<T> = { body: T; headers: Headers; status: number }

export const EmptyResponse = Object.freeze({ body: null, headers: {}, status: 404 })
export const EmptyResponseM = Effect.sync(() => EmptyResponse)
const EmptyResponseMThunk_ = constant(EmptyResponseM)
export function EmptyResponseMThunk<T>(): Effect<
  Readonly<{
    body: null | T
    // eslint-disable-next-line @typescript-eslint/ban-types
    headers: {}
    status: 404
  }>,
  never,
  unknown
> {
  return EmptyResponseMThunk_()
}

export function getBody<R, E, A>(eff: Effect<FetchResponse<A | null>, E, R>) {
  return Effect.flatMap(eff, (r) => r.body === null ? Effect.die("Not found") : Effect.sync(() => r.body))
}
