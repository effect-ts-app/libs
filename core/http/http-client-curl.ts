import { pipe } from "@effect-ts/core"
import * as R from "@effect-ts/core/Collections/Immutable/Dictionary"
import * as T from "@effect-ts/core/Effect"
import * as L from "@effect-ts/core/Effect/Layer"
import * as F from "@effect-ts/core/Function"
import * as O from "@effect-ts/core/Option"
import * as C from "node-libcurl"
import path from "path"
import querystring, { ParsedQuery } from "query-string"

import * as H from "./http-client"

export const Client = (
  _: {
    caPath?: string
    requestTransformer?: F.Endomorphism<C.Curl>
  } = {}
) =>
  L.pure(H.Http)({
    request: (
      method: H.Method,
      url: string,
      requestType: H.RequestType,
      responseType: H.ResponseType,
      headers: Record<string, string>,
      body?: unknown
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): T.IO<H.HttpError<string>, H.Response<any>> =>
      requestType === "FORM" || requestType === "BINARY"
        ? /* istanbul ignore next */ requestType === "FORM"
          ? T.fail({
              // cannot be triggered from exposed functions
              _tag: H.HttpErrorReason.Request,
              error: new Error("multipart form not supported"),
            })
          : T.fail({
              // cannot be triggered from exposed functions
              _tag: H.HttpErrorReason.Request,
              error: new Error("binary not supported"),
            })
        : T.effectAsyncInterrupt((done) => {
            const {
              caPath = path.join(
                require.resolve("@matechs/http-client-libcurl").replace("index.js", ""),
                "../cacert-2019-11-27.pem"
              ),
              requestTransformer = F.identity,
            } = _

            const req = new C.Curl()
            const reqHead = [
              ...H.foldRequestType(
                requestType,
                () => ["Content-Type: application/json"],
                () => ["Content-Type: application/x-www-form-urlencoded"],
                () => ["Content-Type: multipart/form-data"],
                () => ["Content-Type: application/octet-stream"]
              ),
              ...pipe(
                headers,
                R.collect((k, v) => `${k}: ${v}`)
              ),
            ]

            requestTransformer(req)

            req.setOpt("URL", url)
            req.setOpt("CAINFO", caPath)
            req.setOpt("FOLLOWLOCATION", 1)
            req.setOpt("VERBOSE", 0)
            req.setOpt("SSL_VERIFYHOST", 2)
            req.setOpt("SSL_VERIFYPEER", 1)

            req.setOpt(C.Curl.option.HTTPHEADER, reqHead)

            customReq(H.getMethodAsString(method), req, requestType, body)

            req
              .on("error", (error) => {
                done(
                  T.fail({
                    _tag: H.HttpErrorReason.Request,
                    error,
                  })
                )
              })
              .on("end", (statusCode, body, headers) => {
                if (statusCode >= 200 && statusCode < 300) {
                  H.foldResponseType(
                    responseType,
                    () =>
                      // JSON
                      done(
                        T.map_(
                          T.tryCatch(
                            () => JSON.parse(body.toString()),
                            () => ({
                              // TODO: verify what to do exactly, this is not an error from the API => we should enlarge our error type
                              _tag: H.HttpErrorReason.Response,
                              response: getResponse(statusCode, "not a Json", headers),
                            })
                          ),
                          (json) => getResponse(statusCode, json, headers)
                        )
                      ),
                    () =>
                      // TEXT
                      done(
                        T.succeed(getResponse(statusCode, body.toString(), headers))
                      ),
                    () =>
                      Buffer.isBuffer(body)
                        ? done(T.succeed(getResponse(statusCode, body, headers)))
                        : // BINARY
                          done(
                            T.fail({
                              _tag: H.HttpErrorReason.Response,
                              response: getResponse(
                                statusCode,
                                "not a buffer",
                                headers
                              ),
                            })
                          )
                  )
                } else {
                  done(
                    T.fail({
                      _tag: H.HttpErrorReason.Response,
                      response: getResponse(statusCode, body.toString(), headers),
                    })
                  )
                }
              })

            req.perform()

            return T.succeedWith(() => {
              req.close()
            })
          }),
  })

function customReq(
  method: string,
  req: C.Curl,
  requestType: H.RequestType,
  body?: unknown
): void {
  if (body) {
    req.setOpt(
      C.Curl.option.POSTFIELDS,
      H.foldRequestType(
        requestType,
        () => JSON.stringify(body),
        () => querystring.stringify(body as ParsedQuery<string | number | boolean>),
        () => querystring.stringify(body as ParsedQuery<string | number | boolean>),
        () => (body as Buffer).toString("utf-8")
      )
    )
  }

  req.setOpt(C.Curl.option.CUSTOMREQUEST, method)
}

function getResponse<A>(
  statusCode: number,
  body: A,
  headers: Buffer | C.HeaderInfo[]
): H.Response<NonNullable<A>> {
  return {
    status: statusCode,
    body: O.fromNullable(body),
    headers: getHeaders(headers),
  }
}

function getHeaders(headers: Buffer | C.HeaderInfo[]): C.HeaderInfo {
  /* istanbul ignore next */
  return headers.length > 0 ? (typeof headers[0] !== "number" ? headers[0] : {}) : {}
}
