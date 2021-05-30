/* eslint-disable @typescript-eslint/no-explicit-any */
import "abort-controller/polyfill"

import * as L from "@effect-ts/core/Effect/Layer"
import * as O from "@effect-ts/core/Option"
import * as T from "@effect-ts-app/core/ext/Effect"
import { pipe } from "@effect-ts-app/core/ext/Function"
import fetch from "cross-fetch"
import querystring from "query-string"

import * as H from "./http-client"

function getContentType(requestType: H.RequestType): string {
  return H.foldRequestType(
    requestType,
    () => "application/json",
    () => "application/x-www-form-urlencoded",
    () => "multipart/form-data",
    () => "application/octet-stream"
  )
}

function getBody(
  body: unknown,
  requestType: H.RequestType
): string | ArrayBuffer | SharedArrayBuffer | FormData {
  return H.foldRequestType(
    requestType,
    () => JSON.stringify(body),
    () => querystring.stringify(body as any),
    () => body as any as FormData,
    () => body as Buffer
  )
}

const makeAbort = T.succeedWith(() => new AbortController())

export const Client = (fetchApi: typeof fetch) =>
  L.pure(H.Http)({
    request(
      method: H.Method,
      url: string,
      requestType: H.RequestType,
      responseType: H.ResponseType,
      headers: Record<string, string>,
      body: unknown
    ): T.IO<H.HttpError<string>, H.Response<any>> {
      const input: RequestInit = {
        headers: {
          "Content-Type": getContentType(requestType),
          ...headers,
        },
        body: body ? getBody(body, requestType) : undefined,
        method: H.getMethodAsString(method),
      }

      function makeFetch(abort: AbortController) {
        return fetchApi(url, { ...input, signal: abort.signal }).then((resp) => {
          const h: Record<string, string> = {}

          resp.headers.forEach((val, key) => {
            h[key] = val
          })

          if (resp.status >= 200 && resp.status < 300) {
            return H.foldResponseType(
              responseType,
              () =>
                resp.status === 204
                  ? {
                      headers: h,
                      status: resp.status,
                      body: O.fromNullable(void 0),
                    }
                  : resp.json().then((json: unknown) => ({
                      headers: h,
                      status: resp.status,
                      body: O.fromNullable(json),
                    })),
              () =>
                resp.text().then((text) => ({
                  headers: h,
                  status: resp.status,
                  body: O.fromNullable(text),
                })),
              () => {
                if (resp["arrayBuffer"]) {
                  return resp.arrayBuffer().then((arrayBuffer) => ({
                    headers: h,
                    status: resp.status,
                    body: O.fromNullable(Buffer.from(arrayBuffer)),
                  }))
                } else {
                  return ((resp as any).buffer() as Promise<Buffer>).then(
                    (buffer: Buffer) => ({
                      headers: h,
                      status: resp.status,
                      body: O.fromNullable(Buffer.from(buffer)),
                    })
                  )
                }
              }
            )
          } else {
            return resp.text().then((text) => {
              throw {
                _tag: H.HttpErrorReason.Response,
                response: {
                  headers: h,
                  status: resp.status,
                  body: O.fromNullable(text),
                },
              }
            })
          }
        })
      }

      return pipe(
        makeAbort,
        T.chain((abort) =>
          T.tryCatchPromiseWithInterrupt(
            () => makeFetch(abort),
            (err) =>
              H.isHttpResponseError(err)
                ? (err as H.HttpResponseError<string>)
                : { _tag: H.HttpErrorReason.Request, error: err as Error },
            () => abort.abort()
          )
        )
      )
    },
  })
