/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Headers, HttpError, HttpRequestError, HttpResponseError, Method } from "@effect-app/core/http/http-client"
import { constant, flow } from "@effect-app/prelude/Function"
import { Path } from "path-parser"
import qs from "query-string"
import type { REST } from "../schema2.js"
import { ApiConfig } from "./config.js"

export type FetchError = HttpError<string>

export class ResponseError {
  public readonly _tag = "ResponseError"
  constructor(public readonly error: unknown) {}
}

const getClient = HttpClient.flatMap((defaultClient) =>
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
        .mapEffect((_) => _.json.map((body) => ({ status: _.status, body, headers: _.headers })))
        .catchTags({
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
        })
    )
)

export function fetchApi(
  method: Method,
  path: string,
  body?: unknown
) {
  return getClient
    .flatMap((client) =>
      (method === "GET"
        ? client.request(ClientRequest.make(method)(path))
        : body === undefined
        ? client.request(
          ClientRequest
            .make(method)(path)
        )
        : client.request(
          ClientRequest
            .make(method)(path)
            .jsonBody(body)
        ))
        .withSpan("http.request", { attributes: { "http.method": method, "http.url": path } })
    )
    .map((x) => ({ ...x, body: x.body ?? null }))
}

export function fetchApi2S<RequestA, RequestE, ResponseA>(
  encodeRequest: (a: RequestA) => RequestE,
  decodeResponse: (u: unknown) => Effect<never, unknown, ResponseA>
) {
  const decodeRes = (u: unknown) => decodeResponse(u).mapError((err) => new ResponseError(err))
  return (method: Method, path: Path) => (req: RequestA) =>
    fetchApi(
      method,
      method === "DELETE"
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        ? makePathWithQuery(path, req as any)
        : makePathWithBody(path, req as any),
      encodeRequest(req)
    )
      .flatMap(mapResponseM(decodeRes))
      .map((i) => ({
        ...i,
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        body: i.body as ResponseA
      }))
}

export function fetchApi3S<RequestA, RequestE, ResponseE = unknown, ResponseA = void>({
  Request,
  Response
}: {
  // eslint-disable-next-line @typescript-eslint/ban-types
  Request: REST.RequestSchemed<RequestE, RequestA>
  // eslint-disable-next-line @typescript-eslint/ban-types
  Response: REST.ReqRes<ResponseE, ResponseA>
}) {
  const encodeRequest = Request.encodeSync
  const decodeResponse = Response.parse
  return fetchApi2S(encodeRequest, decodeResponse)(
    Request.method,
    new Path(Request.path)
  )
}

export function fetchApi3SE<RequestA, RequestE, ResponseE = unknown, ResponseA = void>({
  Request,
  Response
}: {
  // eslint-disable-next-line @typescript-eslint/ban-types
  Request: REST.RequestSchemed<RequestE, RequestA>
  // eslint-disable-next-line @typescript-eslint/ban-types
  Response: REST.ReqRes<ResponseE, ResponseA>
}) {
  const encodeResponse = Response.encodeSync
  const decodeResponse = flow(Response.parse, (x) => x.map(encodeResponse))
  return fetchApi2S(Request.encodeSync, decodeResponse)(
    Request.method,
    new Path(Request.path)
  )
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
  return (
    path.build(pars, { ignoreSearch: true, ignoreConstraints: true })
    + (Object.keys(pars).length ? "?" + qs.stringify(pars) : "")
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

export function mapResponseM<T, R, E, A>(map: (t: T) => Effect<R, E, A>) {
  return (r: FetchResponse<T>): Effect<R, E, FetchResponse<A>> => {
    return Effect.all({
      body: map(r.body),
      headers: Effect(r.headers),
      status: Effect(r.status)
    })
  }
}
export type FetchResponse<T> = { body: T; headers: Headers; status: number }

export const EmptyResponse = Object.freeze({ body: null, headers: {}, status: 404 })
export const EmptyResponseM = Effect(EmptyResponse)
const EmptyResponseMThunk_ = constant(EmptyResponseM)
export function EmptyResponseMThunk<T>(): Effect<
  unknown,
  never,
  Readonly<{
    body: null | T
    // eslint-disable-next-line @typescript-eslint/ban-types
    headers: {}
    status: 404
  }>
> {
  return EmptyResponseMThunk_()
}

export function getBody<R, E, A>(eff: Effect<R, E, FetchResponse<A | null>>) {
  return eff.flatMap((r) => r.body === null ? Effect.die("Not found") : Effect(r.body))
}
