/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Ex from "@effect-ts/express"
import { Erase } from "@effect-ts-app/core/Effect"
import * as MO from "@effect-ts-app/schema"
import { Encoder, extractSchema } from "@effect-ts-app/schema"
import express from "express"

import {
  NotFoundError,
  NotLoggedInError,
  UnauthorizedError,
  ValidationError,
} from "../errors.js"
import {
  Encode,
  makeRequestParsers,
  Middleware,
  parseRequestParams,
  RequestHandler,
  RequestHandlerOptRes,
  RequestParsers,
  respondSuccess,
} from "./schema/requestHandler.js"
import { makeRouteDescriptor } from "./schema/routing.js"

/*
An app should take ownership over these
*/
export type SupportedErrors =
  | ValidationError
  | NotFoundError
  | NotLoggedInError
  | UnauthorizedError

export function match<
  R,
  PathA,
  CookieA,
  QueryA,
  BodyA,
  HeaderA,
  ReqA extends {} & PathA & QueryA & BodyA,
  ResA,
  R2 = unknown,
  PR = unknown
>(
  r: RequestHandler<
    R,
    PathA,
    CookieA,
    QueryA,
    BodyA,
    HeaderA,
    ReqA,
    ResA,
    SupportedErrors
  >,
  mw?: Middleware<
    R,
    PathA,
    CookieA,
    QueryA,
    BodyA,
    HeaderA,
    ReqA,
    ResA,
    SupportedErrors,
    R2,
    PR
  >
) {
  let h = undefined
  if (mw) {
    const { handle, handler } = mw(r)
    r = handler
    h = handle
  }
  return Ex.match(r.Request.method.toLowerCase() as any)(
    r.Request.path.split("?")[0],
    makeRequestHandler<R, PathA, CookieA, QueryA, BodyA, HeaderA, ReqA, ResA, R2, PR>(
      r,
      h
    )
  ).zipRight(
    Effect.succeedWith(() => makeRouteDescriptor(r.Request.path, r.Request.method, r))
  )
}

export function makeRequestHandler<
  R,
  PathA,
  CookieA,
  QueryA,
  BodyA,
  HeaderA,
  ReqA extends {} & PathA & QueryA & BodyA,
  ResA = void,
  R2 = unknown,
  PR = unknown
>(
  handle: RequestHandlerOptRes<
    R & PR,
    PathA,
    CookieA,
    QueryA,
    BodyA,
    HeaderA,
    ReqA,
    ResA,
    SupportedErrors
  >,
  h?: (req: express.Request, res: express.Response) => Layer<R2, SupportedErrors, PR>
) {
  const { Request, Response } = handle
  const res = Response ? extractSchema(Response as any) : MO.Void
  const encodeResponse = handle.adaptResponse
    ? (req: ReqA) => Encoder.for(handle.adaptResponse(req))
    : () => Encoder.for(res)

  return handleRequest<
    R,
    PathA,
    CookieA,
    QueryA,
    BodyA,
    HeaderA,
    ResA,
    unknown,
    ReqA,
    R2,
    PR
  >(makeRequestParsers(Request), encodeResponse, handle.h, h)
}
export function handleRequest<
  R,
  PathA,
  CookieA,
  QueryA,
  BodyA,
  HeaderA,
  ResA,
  ResE,
  ReqA extends {} & PathA & BodyA & QueryA,
  R2 = unknown,
  PR = unknown
>(
  requestParsers: RequestParsers<PathA, CookieA, QueryA, BodyA, HeaderA>,
  encodeResponse: (r: ReqA) => Encode<ResA, ResE>,
  handle: (r: ReqA) => Effect<R & PR, SupportedErrors, ResA>,
  h?: (req: express.Request, res: express.Response) => Layer<R2, SupportedErrors, PR>
) {
  const parseRequest = parseRequestParams(requestParsers)
  const respond = respondSuccess(encodeResponse)
  return (req: express.Request, res: express.Response) =>
    parseRequest(req)
      .map(({ body, path, query }) => {
        const hn = {
          ...Maybe.toUndefined(body),
          ...Maybe.toUndefined(query),
          ...Maybe.toUndefined(path),
        } as ReqA
        return hn
      })
      .flatMap((inp) => {
        const hn = handle(inp)
        const r = h ? Effect.provideSomeLayer(h(req, res))(hn) : hn
        return (
          r as unknown as Effect<Erase<R & R2, PR>, SupportedErrors, ResA>
        ).flatMap((outp) => respond(inp, res)(outp))
      })
      .catch("_tag", "ValidationError", (err) =>
        Effect.succeedWith(() => {
          res.status(400).send(err.errors)
        })
      )
      .catch("_tag", "NotFoundError", (err) =>
        Effect.succeedWith(() => {
          res.status(404).send(err)
        })
      )
      .catch("_tag", "NotLoggedInError", (err) =>
        Effect.succeedWith(() => {
          res.status(401).send(err)
        })
      )
      .catch("_tag", "UnauthorizedError", (err) =>
        Effect.succeedWith(() => {
          res.status(403).send(err)
        })
      )
      // final catch all; expecting never so that unhandled known errors will show up
      .catchAll((err: never) =>
        Effect.succeedWith(() =>
          console.error(
            "Program error, compiler probably silenced, got an unsupported Error in Error Channel of Effect",
            err
          )
        ).flatMap(Effect.die)
      )
      .tapCause(() => Effect.succeedWith(() => res.status(500).send()))
}

// Additional convenience helpers

export function get<
  R,
  PathA,
  CookieA,
  QueryA,
  BodyA,
  HeaderA,
  ReqA extends {} & PathA & QueryA & BodyA,
  ResA,
  R2 = unknown,
  PR = unknown
>(
  path: string,
  r: RequestHandler<
    R,
    PathA,
    CookieA,
    QueryA,
    BodyA,
    HeaderA,
    ReqA,
    ResA,
    SupportedErrors
  >,
  mw?: Middleware<
    R,
    PathA,
    CookieA,
    QueryA,
    BodyA,
    HeaderA,
    ReqA,
    ResA,
    SupportedErrors,
    R2,
    PR
  >
) {
  let h = undefined
  if (mw) {
    const { handle, handler } = mw(r)
    r = handler
    h = handle
  }
  return Ex.get(
    path,
    makeRequestHandler<R, PathA, CookieA, QueryA, BodyA, HeaderA, ReqA, ResA, R2, PR>(
      r,
      h
    )
  ).zipRight(Effect.succeedWith(() => makeRouteDescriptor(path, "GET", r)))
}

export function post<
  R,
  PathA,
  CookieA,
  QueryA,
  BodyA,
  HeaderA,
  ReqA extends {} & PathA & QueryA & BodyA,
  ResA = void,
  R2 = unknown,
  PR = unknown
>(
  path: string,
  r: RequestHandler<
    R,
    PathA,
    CookieA,
    QueryA,
    BodyA,
    HeaderA,
    ReqA,
    ResA,
    SupportedErrors
  >,
  mw?: Middleware<
    R,
    PathA,
    CookieA,
    QueryA,
    BodyA,
    HeaderA,
    ReqA,
    ResA,
    SupportedErrors,
    R2,
    PR
  >
) {
  let h = undefined
  if (mw) {
    const { handle, handler } = mw(r)
    r = handler
    h = handle
  }
  return Ex.post(
    path,
    makeRequestHandler<R, PathA, CookieA, QueryA, BodyA, HeaderA, ReqA, ResA, R2, PR>(
      r,
      h
    )
  ).zipRight(Effect.succeedWith(() => makeRouteDescriptor(path, "POST", r)))
}

export function put<
  R,
  PathA,
  CookieA,
  QueryA,
  BodyA,
  HeaderA,
  ReqA extends {} & PathA & QueryA & BodyA,
  ResA = void,
  R2 = unknown,
  PR = unknown
>(
  path: string,
  r: RequestHandler<
    R,
    PathA,
    CookieA,
    QueryA,
    BodyA,
    HeaderA,
    ReqA,
    ResA,
    SupportedErrors
  >,
  mw?: Middleware<
    R,
    PathA,
    CookieA,
    QueryA,
    BodyA,
    HeaderA,
    ReqA,
    ResA,
    SupportedErrors,
    R2,
    PR
  >
) {
  let h = undefined
  if (mw) {
    const { handle, handler } = mw(r)
    r = handler
    h = handle
  }
  return Ex.put(
    path,
    makeRequestHandler<R, PathA, CookieA, QueryA, BodyA, HeaderA, ReqA, ResA, R2, PR>(
      r,
      h
    )
  ).zipRight(Effect.succeedWith(() => makeRouteDescriptor(path, "PUT", r)))
}

export function patch<
  R,
  PathA,
  CookieA,
  QueryA,
  BodyA,
  HeaderA,
  ReqA extends {} & PathA & QueryA & BodyA,
  ResA = void,
  R2 = unknown,
  PR = unknown
>(
  path: string,
  r: RequestHandler<
    R,
    PathA,
    CookieA,
    QueryA,
    BodyA,
    HeaderA,
    ReqA,
    ResA,
    SupportedErrors
  >,
  mw?: Middleware<
    R,
    PathA,
    CookieA,
    QueryA,
    BodyA,
    HeaderA,
    ReqA,
    ResA,
    SupportedErrors,
    R2,
    PR
  >
) {
  let h = undefined
  if (mw) {
    const { handle, handler } = mw(r)
    r = handler
    h = handle
  }
  return Ex.patch(
    path,
    makeRequestHandler<R, PathA, CookieA, QueryA, BodyA, HeaderA, ReqA, ResA, R2, PR>(
      r,
      h
    )
  ).zipRight(Effect.succeedWith(() => makeRouteDescriptor(path, "PATCH", r)))
}

function del<
  R,
  PathA,
  CookieA,
  QueryA,
  BodyA,
  HeaderA,
  ReqA extends {} & PathA & QueryA & BodyA,
  ResA = void,
  R2 = unknown,
  PR = unknown
>(
  path: string,
  r: RequestHandler<
    R,
    PathA,
    CookieA,
    QueryA,
    BodyA,
    HeaderA,
    ReqA,
    ResA,
    SupportedErrors
  >,
  mw?: Middleware<
    R,
    PathA,
    CookieA,
    QueryA,
    BodyA,
    HeaderA,
    ReqA,
    ResA,
    SupportedErrors,
    R2,
    PR
  >
) {
  let h = undefined
  if (mw) {
    const { handle, handler } = mw(r)
    r = handler
    h = handle
  }
  return Ex.delete(
    path,
    makeRequestHandler<R, PathA, CookieA, QueryA, BodyA, HeaderA, ReqA, ResA, R2, PR>(
      r,
      h
    )
  ).zipRight(Effect.succeedWith(() => makeRouteDescriptor(path, "DELETE", r)))
}

export { del as delete }
