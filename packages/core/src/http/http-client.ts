/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Option } from "../Option.js"

export const Method = {
  GET: null,
  POST: null,
  PUT: null,
  DELETE: null,
  PATCH: null
}
export type Method = keyof typeof Method

/** @deprecated use @effect/platform */
export type Headers = Record<string, string>

/** @deprecated use @effect/platform */
export interface Response<Body> {
  body: Option<Body>
  headers: Headers
  status: number
}

/** @deprecated use @effect/platform */
export const HttpErrorReason = {
  Request: "HttpErrorRequest",
  Response: "HttpErrorResponse"
} as const

/** @deprecated use @effect/platform */
export type HttpErrorReason = typeof HttpErrorReason

/** @deprecated use @effect/platform */
export interface HttpResponseError<ErrorBody> {
  _tag: HttpErrorReason["Response"]
  response: Response<ErrorBody>
}

/** @deprecated use @effect/platform */
export function isHttpResponseError(
  u: unknown
): u is HttpResponseError<unknown> {
  return (
    typeof u === "object"
    && u !== null
    && (u as any)["_tag"] === HttpErrorReason.Response
  )
}

/** @deprecated use @effect/platform */
export interface HttpRequestError {
  _tag: HttpErrorReason["Request"]
  error: Error
}

/** @deprecated use @effect/platform */
export function isHttpRequestError(u: unknown): u is HttpRequestError {
  return (
    typeof u === "object"
    && u !== null
    && (u as any)["_tag"] === HttpErrorReason.Request
  )
}

/** @deprecated use @effect/platform */
export function isHttpError(u: unknown): u is HttpError<unknown> {
  return isHttpRequestError(u) || isHttpResponseError(u)
}

/** @deprecated use @effect/platform */
export type HttpError<ErrorBody> =
  | HttpRequestError
  | HttpResponseError<ErrorBody>
