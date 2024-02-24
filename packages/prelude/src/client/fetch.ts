/* eslint-disable @typescript-eslint/no-explicit-any */
import { Effect, Option } from "@effect-app/core"
import { constant } from "@effect-app/core/Function"
import type { Headers, HttpError, HttpRequestError, HttpResponseError, Method } from "@effect-app/core/http/http-client"
import { ReadonlyRecord } from "effect"
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
  UnauthorizedError,
  ValidationError
} from "./errors.js"

import type { ResponseError } from "@effect/platform/Http/ClientError"
import { HttpClient, HttpClientRequest } from "../http.js"
import { S } from "../lib.js"

export type FetchError = HttpError<string>

export class ResError {
  public readonly _tag = "ResponseError"
  constructor(public readonly error: unknown) {}
}

const getClient = Effect.flatMap(HttpClient.Client, (defaultClient) =>
  ApiConfig
    .Tag
    .map(({ apiUrl, headers }) =>
      defaultClient
        .filterStatusOk
        .mapRequest((_) =>
          _
            .acceptJson
            .prependUrl(apiUrl)
            .setHeaders({
              "request-id": headers.flatMap((_) => _.get("request-id")).value ?? StringId.make(),
              ...headers.map((_) => Object.fromEntries(_)).value
            })
        )
        .tapRequest((r) =>
          Effect
            .logDebug(`[HTTP] ${r.method}`)
            .annotateLogs("url", r.url)
            .annotateLogs("body", r.body._tag === "Uint8Array" ? new TextDecoder().decode(r.body.body) : r.body._tag)
            .annotateLogs("headers", r.headers)
        )
        .mapEffect((_) =>
          _.status === 204
            ? Effect.sync(() => ({ status: _.status, body: void 0, headers: _.headers }))
            : _.json.map((body) => ({ status: _.status, body, headers: _.headers }))
        )
        .catchTag(
          "ResponseError",
          (err): Effect<FetchResponse<unknown>, ResponseError | SupportedErrors> => {
            const toError = <R, From, To>(s: Schema<To, From, R>) =>
              err.response.json.flatMap((_) => s.decodeUnknown(_).catchAll(() => Effect.fail(err))).flatMap(Effect.fail)

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
            if (err.response.status === 403) {
              return toError(UnauthorizedError)
            }
            if (err.response.status === 412) {
              return toError(OptimisticConcurrencyException)
            }
            return Effect.fail(err)
          }
        )
        .pipe(HttpClient.catchTags({
          "ResponseError": (err) =>
            err
              .response
              .text
              // TODO
              .orDie
              .flatMap((_) =>
                Effect.fail({
                  _tag: "HttpErrorResponse" as const,
                  response: { body: Option.fromNullable(_), status: err.response.status, headers: err.response.headers }
                } as HttpResponseError<unknown>)
              ),
          "RequestError": (err) => Effect.fail({ _tag: "HttpErrorRequest", error: err.error } as HttpRequestError)
        }))
    ))

export function fetchApi(
  method: Method,
  path: string,
  body?: unknown
) {
  return getClient
    .flatMap((client) =>
      (method === "GET"
        ? client.request(HttpClientRequest.make(method)(path))
        : body === undefined
        ? client.request(
          HttpClientRequest
            .make(method)(path)
        )
        : client.request(
          HttpClientRequest
            .make(method)(path)
            .jsonBody(body)
        ))
        .scoped
        .withSpan("http.request", { attributes: { "http.method": method, "http.url": path } })
    )
}

export function fetchApi2S<RequestR, RequestFrom, RequestTo, ResponseR, ResponseFrom, ResponseTo>(
  request: Schema<RequestTo, RequestFrom, RequestR>,
  response: Schema<ResponseTo, ResponseFrom, ResponseR>
) {
  const encodeRequest = request.encode
  const decRes = response.decodeUnknown
  const decodeRes = (u: unknown) => decRes(u).mapError((err) => new ResError(err))
  return (method: Method, path: Path) => (req: RequestTo) => {
    return encodeRequest(req).andThen((encoded) =>
      fetchApi(
        method,
        method === "DELETE"
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          ? makePathWithQuery(path, encoded as any)
          : makePathWithBody(path, encoded as any),
        encoded
      )
        .flatMap(mapResponseM(decodeRes))
        .map((i) => ({
          ...i,
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          body: i.body as ResponseTo
        }))
    )
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
  const encode = S.encode(Response)
  return (req: RequestA) => a(req).flatMap(mapResponseM((_) => encode(_)))
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
  const forQs = ReadonlyRecord.filter(pars, (_, k) => !path.params.includes(k))
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
    return Effect.all({
      body: map(r.body),
      headers: Effect.sync(() => r.headers),
      status: Effect.sync(() => r.status)
    })
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
  return eff.flatMap((r) => r.body === null ? Effect.die("Not found") : Effect.sync(() => r.body))
}
