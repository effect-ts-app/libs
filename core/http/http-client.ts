/* eslint-disable @typescript-eslint/no-explicit-any */
import * as T from "@effect-ts/core/Effect"
import * as L from "@effect-ts/core/Effect/Layer"
import { pipe, Predicate } from "@effect-ts/core/Function"
import * as Has from "@effect-ts/core/Has"
import * as O from "@effect-ts/core/Option"
import { ParsedQuery } from "query-string"

/* tested in the implementation packages */
/* istanbul ignore file */

export const Method = {
  GET: null,
  POST: null,
  PUT: null,
  DELETE: null,
  PATCH: null,
}
export type Method = keyof typeof Method

type Indexed<A extends string, B extends string> = {
  [a in A]: { [b in B]: any }
}
type MakeIndexed<A extends string, B extends string, T extends Indexed<A, B>> = T

export type RequestType = "JSON" | "DATA" | "FORM" | "BINARY"

export type RequestBodyTypes = MakeIndexed<
  RequestType,
  Method,
  {
    JSON: {
      GET: unknown
      POST: unknown
      PUT: unknown
      DELETE: unknown
      PATCH: unknown
    }
    DATA: {
      GET: ParsedQuery<string | number | boolean>
      POST: ParsedQuery<string | number | boolean>
      PUT: ParsedQuery<string | number | boolean>
      DELETE: ParsedQuery<string | number | boolean>
      PATCH: ParsedQuery<string | number | boolean>
    }
    FORM: {
      GET: FormData
      POST: FormData
      PUT: FormData
      DELETE: FormData
      PATCH: FormData
    }
    BINARY: {
      GET: Buffer
      POST: Buffer
      PUT: Buffer
      DELETE: Buffer
      PATCH: Buffer
    }
  }
>

export type ResponseType = "JSON" | "TEXT" | "BINARY"
export type ResponseTypes = MakeIndexed<
  ResponseType,
  Method,
  {
    JSON: {
      GET: unknown
      POST: unknown
      PUT: unknown
      DELETE: unknown
      PATCH: unknown
    }
    TEXT: {
      GET: string
      POST: string
      PUT: string
      DELETE: string
      PATCH: string
    }
    BINARY: {
      GET: Buffer
      POST: Buffer
      PUT: Buffer
      DELETE: Buffer
      PATCH: Buffer
    }
  }
>

export interface DataInput {
  [k: string]: unknown
}

export type Headers = Record<string, string>

export interface Response<Body> {
  body: O.Option<Body>
  headers: Headers
  status: number
}

export const HttpErrorReason = {
  Request: "HttpErrorRequest",
  Response: "HttpErrorResponse",
} as const

export type HttpErrorReason = typeof HttpErrorReason

export interface HttpResponseError<ErrorBody> {
  _tag: HttpErrorReason["Response"]
  response: Response<ErrorBody>
}

export function isHttpResponseError(u: unknown): u is HttpResponseError<unknown> {
  return (
    typeof u === "object" &&
    u !== null &&
    (u as any)["_tag"] === HttpErrorReason.Response
  )
}

export interface HttpRequestError {
  _tag: HttpErrorReason["Request"]
  error: Error
}

export function isHttpRequestError(u: unknown): u is HttpRequestError {
  return (
    typeof u === "object" &&
    u !== null &&
    (u as any)["_tag"] === HttpErrorReason.Request
  )
}

export function isHttpError(u: unknown): u is HttpError<unknown> {
  return isHttpRequestError(u) || isHttpResponseError(u)
}

export type HttpError<ErrorBody> = HttpRequestError | HttpResponseError<ErrorBody>

export function foldHttpError<A, B, ErrorBody>(
  onError: (e: Error) => A,
  onResponseError: (e: Response<ErrorBody>) => B
): (err: HttpError<ErrorBody>) => A | B {
  return (err) => {
    switch (err._tag) {
      case "HttpErrorRequest":
        return onError(err.error)
      case "HttpErrorResponse":
        return onResponseError(err.response)
    }
  }
}

export interface HttpHeaders extends Record<string, string> {}
export const HttpHeaders = Has.tag<HttpHeaders>()
const accessHttpHeaders_ = T.access(HttpHeaders.readOption)
export function accessHttpHeadersM<R, E, A>(
  eff: (h: O.Option<HttpHeaders>) => T.Effect<R, E, A>
) {
  return pipe(accessHttpHeaders_, T.chain(eff))
}
export function accessHttpHeaders<A>(eff: (h: O.Option<HttpHeaders>) => A) {
  return pipe(accessHttpHeaders_, T.map(eff))
}

export interface HttpOps {
  request<M extends Method, Req extends RequestType, Resp extends ResponseType>(
    method: M,
    url: string,
    requestType: Req,
    responseType: Resp,
    headers: Record<string, string>,
    body: RequestBodyTypes[Req][M]
  ): T.IO<HttpError<string>, Response<ResponseTypes[Resp][M]>>
}

export interface Http extends HttpOps {}
export const Http = Has.tag<HttpOps>()
// const accessHttp = T.accessService(Http)
const accessHttpM = T.accessServiceM(Http)

export type RequestF = <
  R,
  M extends Method,
  Req extends RequestType,
  Resp extends ResponseType
>(
  method: M,
  url: string,
  requestType: Req,
  responseType: Resp,
  body?: RequestBodyTypes[Req][M]
) => T.Effect<RequestEnv & R, HttpError<string>, Response<ResponseTypes[Resp][M]>>

export type RequestMiddleware = (request: RequestF) => RequestF

export interface MiddlewareStack {
  stack: RequestMiddleware[] // todo; is optional.
}

export const MiddlewareStack = Has.tag<MiddlewareStack>()

const accessMiddlewareStack_ = T.access(MiddlewareStack.readOption)
export function accessMiddlewareStackM<R, E, A>(
  eff: (h: O.Option<MiddlewareStack>) => T.Effect<R, E, A>
) {
  return pipe(accessMiddlewareStack_, T.chain(eff))
}
export function accessMiddlewareStack<A>(eff: (h: O.Option<MiddlewareStack>) => A) {
  return pipe(accessMiddlewareStack_, T.map(eff))
}

export const LiveMiddlewareStack = (stack: RequestMiddleware[] = []) =>
  L.pure(MiddlewareStack)({
    stack,
  })

export type RequestEnv = Has.Has<Http>

function foldMiddlewareStack(env: MiddlewareStack | null, request: RequestF): RequestF {
  if (env && env.stack.length > 0) {
    let r = request

    for (const middleware of env.stack) {
      r = middleware(r)
    }

    return r
  }

  return request
}

export function requestInner<
  R,
  M extends Method,
  Req extends RequestType,
  Resp extends ResponseType
>(
  method: M,
  url: string,
  requestType: Req,
  responseType: Resp,
  body: RequestBodyTypes[Req][M]
): T.Effect<RequestEnv & R, HttpError<string>, Response<ResponseTypes[Resp][M]>> {
  return accessHttpHeadersM((headers) =>
    accessHttpM((h) =>
      h.request<M, Req, Resp>(
        method,
        url,
        requestType,
        responseType,
        O.getOrElse_(headers, () => ({})),
        body
      )
    )
  )
}

export function request<R, Req extends RequestType, Resp extends ResponseType>(
  method: "GET",
  requestType: Req,
  responseType: Resp
): (
  url: string,
  body?: RequestBodyTypes[Req]["GET"]
) => T.Effect<RequestEnv & R, HttpError<string>, Response<ResponseTypes[Resp]["GET"]>>
export function request<R, Req extends RequestType, Resp extends ResponseType>(
  method: "DELETE",
  requestType: Req,
  responseType: Resp
): (
  url: string,
  body?: RequestBodyTypes[Req]["DELETE"]
) => T.Effect<
  RequestEnv & R,
  HttpError<string>,
  Response<ResponseTypes[Resp]["DELETE"]>
>
export function request<
  R,
  M extends Method,
  Req extends RequestType,
  Resp extends ResponseType
>(
  method: M,
  requestType: Req,
  responseType: Resp
): (
  url: string,
  body: RequestBodyTypes[Req][M]
) => T.Effect<RequestEnv & R, HttpError<string>, Response<ResponseTypes[Resp][M]>>
export function request<
  R,
  M extends Method,
  Req extends RequestType,
  Resp extends ResponseType
>(
  method: M,
  requestType: Req,
  responseType: Resp
): (
  url: string,
  body: RequestBodyTypes[Req][M]
) => T.Effect<RequestEnv & R, HttpError<string>, Response<ResponseTypes[Resp][M]>> {
  return (url, body) =>
    accessMiddlewareStackM((s) =>
      foldMiddlewareStack(O.toNullable(s), requestInner)<R, M, Req, Resp>(
        method,
        url,
        requestType,
        responseType,
        body
      )
    )
}

export const get =
  /*#__PURE__*/
  (() => request("GET", "JSON", "JSON"))()

export const post =
  /*#__PURE__*/
  (() => request("POST", "JSON", "JSON"))()

export const postReturnText =
  /*#__PURE__*/
  (() => request("POST", "JSON", "TEXT"))()

export const postData =
  /*#__PURE__*/
  (() => request("POST", "DATA", "JSON"))()

export const postBinaryGetBinary =
  /*#__PURE__*/
  (() => request("POST", "BINARY", "BINARY"))()

export const patch =
  /*#__PURE__*/
  (() => request("PATCH", "JSON", "JSON"))()

export const patchData =
  /*#__PURE__*/
  (() => request("PATCH", "DATA", "JSON"))()

export const patchBinaryGetBinary =
  /*#__PURE__*/
  (() => request("PATCH", "BINARY", "BINARY"))()

export const put =
  /*#__PURE__*/
  (() => request("PUT", "JSON", "JSON"))()

export const putData =
  /*#__PURE__*/
  (() => request("PUT", "DATA", "JSON"))()

export const postForm =
  /*#__PURE__*/
  (() => request("POST", "FORM", "JSON"))()

export const putForm =
  /*#__PURE__*/
  (() => request("PUT", "FORM", "JSON"))()

export const patchForm =
  /*#__PURE__*/
  (() => request("PATCH", "FORM", "JSON"))()

export const putBinaryGetBinary =
  /*#__PURE__*/
  (() => request("PUT", "BINARY", "BINARY"))()

export const del =
  /*#__PURE__*/
  (() => request("DELETE", "JSON", "JSON"))()

export const delForm =
  /*#__PURE__*/
  (() => request("DELETE", "FORM", "JSON"))()

export const delData =
  /*#__PURE__*/
  (() => request("DELETE", "DATA", "JSON"))()

export const delBinaryGetBinary =
  /*#__PURE__*/
  (() => request("DELETE", "BINARY", "BINARY"))()

export function withHeaders(
  headers: Record<string, string>,
  replace = false
): <R, E, A>(eff: T.Effect<R, E, A>) => T.Effect<R, E, A> {
  return <R, E, A>(eff: T.Effect<R, E, A>) =>
    replace
      ? T.accessM((r: R) => T.provide({ ...r, [HttpHeaders.key]: headers })(eff))
      : T.accessM((r: R) =>
          T.provide({
            ...r,
            [HttpHeaders.key]: { ...(r as any)[HttpHeaders.key], ...headers },
          })(eff)
        )
}

export function withPathHeaders(
  headers: Record<string, string>,
  path: Predicate<string>,
  replace = false
): RequestMiddleware {
  return (req) => (m, u, reqT, respT, b) =>
    path(u)
      ? withHeaders(headers, replace)(req(m, u, reqT, respT, b))
      : req(m, u, reqT, respT, b)
}

export function foldRequestType<A, B, C, D>(
  requestType: RequestType,
  onJson: () => A,
  onData: () => B,
  onForm: () => C,
  onBinary: () => D
): A | B | C | D {
  switch (requestType) {
    case "JSON":
      return onJson()
    case "DATA":
      return onData()
    case "FORM":
      return onForm()
    case "BINARY":
      return onBinary()
  }
}

export function foldResponseType<A, B, C>(
  responseType: ResponseType,
  onJson: () => A,
  onText: () => B,
  onBinary: () => C
): A | B | C {
  switch (responseType) {
    case "JSON":
      return onJson()
    case "TEXT":
      return onText()
    case "BINARY":
      return onBinary()
  }
}

export function getMethodAsString(method: Method) {
  switch (method) {
    case "GET":
      return "GET"
    case "POST":
      return "POST"
    case "PUT":
      return "PUT"
    case "PATCH":
      return "PATCH"
    case "DELETE":
      return "DELETE"
  }
}
