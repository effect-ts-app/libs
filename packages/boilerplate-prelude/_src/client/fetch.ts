/* eslint-disable @typescript-eslint/no-explicit-any */
import { constant } from "@effect-ts-app/boilerplate-prelude/Function"
import type { ReqRes, RequestSchemed } from "@effect-ts-app/boilerplate-prelude/schema"
import * as H from "@effect-ts-app/core/http/http-client"
import { Path } from "path-parser"
import { stringify } from "querystring"

import { getConfig } from "./config.js"

export type FetchError = H.HttpError<string>

export class ResponseError {
  public readonly _tag = "ResponseError"
  constructor(public readonly error: unknown) {}
}

export const mapResponseErrorS = Effect.$.mapError(
  (err: unknown) => new ResponseError(err)
)

export function fetchApi(method: H.Method, path: string, body?: unknown) {
  const request = H.request(method, "JSON", "JSON")
  return getConfig(({ apiUrl, headers }) =>
    H.withHeaders({
      Connection: "keep-alive",
      "request-id": (headers ? headers["request-id"] : null) ?? StringId.make(),
      ...headers
    })(request(`${apiUrl}${path}`, body))
      .map(x => ({ ...x, body: x.body.value ?? null }))
  )
}
export function fetchApi2S<RequestA, RequestE, ResponseA>(
  encodeRequest: (a: RequestA) => RequestE,
  decodeResponse: (u: unknown) => Effect<never, unknown, ResponseA>
) {
  const decodeRes = flow(
    decodeResponse,
    Effect.$.mapError(err => new ResponseError(err))
  )
  return (method: H.Method, path: Path) =>
    (req: RequestA) =>
      fetchApi(
        method,
        method === "DELETE"
          ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            makePathWithQuery(path, req as any)
          : makePathWithBody(path, req as any),
        encodeRequest(req)
      )
        .flatMap(mapResponseM(decodeRes))
        .map(i => ({
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
  Request: RequestSchemed<RequestE, RequestA>
  // eslint-disable-next-line @typescript-eslint/ban-types
  Response: ReqRes<ResponseE, ResponseA>
}) {
  const encodeRequest = Request.Encoder
  const decodeResponse = Parser.for(Response)["|>"](condemnCustom)
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
  Request: RequestSchemed<RequestE, RequestA>
  // eslint-disable-next-line @typescript-eslint/ban-types
  Response: ReqRes<ResponseE, ResponseA>
}) {
  const encodeRequest = Request.Encoder
  const encodeResponse = Encoder.for(Response)
  const decodeResponse = flow(Parser.for(Response)["|>"](condemnCustom), x => x.map(encodeResponse))
  return fetchApi2S(encodeRequest, decodeResponse)(
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
    path.build(pars, { ignoreSearch: true, ignoreConstraints: true }) +
    (Object.keys(pars).length ? "?" + stringify(pars) : "")
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
    return Effect.struct({
      body: map(r.body),
      headers: Effect(r.headers),
      status: Effect(r.status)
    })
  }
}
export type FetchResponse<T> = { body: T; headers: H.Headers; status: number }

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
  return eff.flatMap(r => r.body === null ? Effect.die("Not found") : Effect(r.body))
}
