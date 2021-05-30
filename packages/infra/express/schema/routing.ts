/* eslint-disable @typescript-eslint/no-explicit-any */
import { pipe } from "@effect-ts/core"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import * as T from "@effect-ts/core/Effect"
import * as O from "@effect-ts/core/Option"
import * as Ex from "@effect-ts/express"
import * as EO from "@effect-ts-app/core/ext/EffectOption"
import * as S from "@effect-ts-app/core/ext/Schema"
import { Methods } from "@effect-ts-app/core/ext/Schema"
import * as TUP from "@effect-ts-app/core/ext/Tuple"
import { Tuple } from "@effect-ts-app/core/ext/Tuple"

import * as OpenApi from "../../Openapi"
import {
  isObjectSchema,
  JSONSchema,
  ParameterLocation,
  SubSchema,
} from "../../Openapi/atlas-plutus"
import {
  makeRequestHandler,
  Middleware,
  RequestHandler,
  RequestHandlerOptRes,
} from "./requestHandler"

export function asRouteDescriptionAny<R extends RouteDescriptorAny>(i: R) {
  return i as RouteDescriptorAny
}

export function tupAsRouteDescriptionAny<R extends RouteDescriptorAny>(
  tup: Tuple<A.Array<R>>
) {
  return TUP.map_(tup, asRouteDescriptionAny)
}

export function arrAsRouteDescriptionAny<R extends RouteDescriptorAny>(
  arr: A.Array<R>
) {
  return A.map_(arr, asRouteDescriptionAny)
}

export interface RouteDescriptor<
  R,
  PathA,
  CookieA,
  QueryA,
  BodyA,
  HeaderA,
  ReqA extends PathA & QueryA & BodyA,
  ResA,
  METHOD extends Methods = Methods
> {
  path: string
  method: METHOD
  handler: RequestHandler<R, PathA, CookieA, QueryA, BodyA, HeaderA, ReqA, ResA>
  info?: {
    tags: A.Array<string>
  }
}

export type RouteDescriptorAny = RouteDescriptor<any, any, any, any, any, any, any, any>

export function makeRouteDescriptor<
  R,
  PathA,
  CookieA,
  QueryA,
  BodyA,
  HeaderA,
  ReqA extends PathA & QueryA & BodyA,
  ResA = void,
  METHOD extends Methods = Methods
>(
  path: string,
  method: METHOD,
  handler: RequestHandlerOptRes<R, PathA, CookieA, QueryA, BodyA, HeaderA, ReqA, ResA>
) {
  return { path, method, handler, _tag: "Schema" } as RouteDescriptor<
    R,
    PathA,
    CookieA,
    QueryA,
    BodyA,
    HeaderA,
    ReqA,
    ResA,
    METHOD
  >
}

// export function match<
//   R,
//   Path extends string,
//   Method extends Methods,
//   ReqA,
//   ResA,
//   R2 = unknown,
//   PR = unknown
// >(
//   r: RequestHandler2<R, Path, Method, ReqA, ResA>,
//   mw?: Middleware2<R, ReqA, ResA, R2, PR>
// ) {
//   //r.Request = S.adaptRequest(r.Request as any) as any

//   let h = undefined
//   if (mw) {
//     const { handle, handler } = mw(r)
//     r = handler as any
//     h = handle
//   }

//   return pipe(
//     Ex.match(r.Request.method.toLowerCase() as any)(
//       r.Request.path,
//       //makeRequestHandler2<R, Path, Method, ReqA, ResA, R2, PR>(r, h)
//       makeRequestHandler<R, any, any, any, any, any, ReqA, ResA, R2, PR>(r, h)
//     ),
//     T.zipRight(
//       T.succeedWith(() =>
//         makeRouteDescriptor(r.Request.path, r.Request.method, r as any)
//       )
//     )
//   )
// }

export function match<
  R,
  PathA,
  CookieA,
  QueryA,
  BodyA,
  HeaderA,
  ReqA extends PathA & QueryA & BodyA,
  ResA,
  R2 = unknown,
  PR = unknown
>(
  r: RequestHandler<R, PathA, CookieA, QueryA, BodyA, HeaderA, ReqA, ResA>,
  mw?: Middleware<R, PathA, CookieA, QueryA, BodyA, HeaderA, ReqA, ResA, R2, PR>
) {
  let h = undefined
  if (mw) {
    const { handle, handler } = mw(r)
    r = handler
    h = handle
  }
  return pipe(
    Ex.match(r.Request.method.toLowerCase() as any)(
      r.Request.path,
      makeRequestHandler<R, PathA, CookieA, QueryA, BodyA, HeaderA, ReqA, ResA, R2, PR>(
        r,
        h
      )
    ),
    T.zipRight(
      T.succeedWith(() => makeRouteDescriptor(r.Request.path, r.Request.method, r))
    )
  )
}

export function get<
  R,
  PathA,
  CookieA,
  QueryA,
  BodyA,
  HeaderA,
  ReqA extends PathA & QueryA & BodyA,
  ResA,
  R2 = unknown,
  PR = unknown
>(
  path: string,
  r: RequestHandler<R, PathA, CookieA, QueryA, BodyA, HeaderA, ReqA, ResA>,
  mw?: Middleware<R, PathA, CookieA, QueryA, BodyA, HeaderA, ReqA, ResA, R2, PR>
) {
  let h = undefined
  if (mw) {
    const { handle, handler } = mw(r)
    r = handler
    h = handle
  }
  return pipe(
    Ex.get(
      path,
      makeRequestHandler<R, PathA, CookieA, QueryA, BodyA, HeaderA, ReqA, ResA, R2, PR>(
        r,
        h
      )
    ),
    T.zipRight(T.succeedWith(() => makeRouteDescriptor(path, "GET", r)))
  )
}

export function post<
  R,
  PathA,
  CookieA,
  QueryA,
  BodyA,
  HeaderA,
  ReqA extends PathA & QueryA & BodyA,
  ResA = void,
  R2 = unknown,
  PR = unknown
>(
  path: string,
  r: RequestHandler<R, PathA, CookieA, QueryA, BodyA, HeaderA, ReqA, ResA>,
  mw?: Middleware<R, PathA, CookieA, QueryA, BodyA, HeaderA, ReqA, ResA, R2, PR>
) {
  let h = undefined
  if (mw) {
    const { handle, handler } = mw(r)
    r = handler
    h = handle
  }
  return pipe(
    Ex.post(
      path,
      makeRequestHandler<R, PathA, CookieA, QueryA, BodyA, HeaderA, ReqA, ResA, R2, PR>(
        r,
        h
      )
    ),
    T.zipRight(T.succeedWith(() => makeRouteDescriptor(path, "POST", r)))
  )
}

export function put<
  R,
  PathA,
  CookieA,
  QueryA,
  BodyA,
  HeaderA,
  ReqA extends PathA & QueryA & BodyA,
  ResA = void,
  R2 = unknown,
  PR = unknown
>(
  path: string,
  r: RequestHandler<R, PathA, CookieA, QueryA, BodyA, HeaderA, ReqA, ResA>,
  mw?: Middleware<R, PathA, CookieA, QueryA, BodyA, HeaderA, ReqA, ResA, R2, PR>
) {
  let h = undefined
  if (mw) {
    const { handle, handler } = mw(r)
    r = handler
    h = handle
  }
  return pipe(
    Ex.put(
      path,
      makeRequestHandler<R, PathA, CookieA, QueryA, BodyA, HeaderA, ReqA, ResA, R2, PR>(
        r,
        h
      )
    ),
    T.zipRight(T.succeedWith(() => makeRouteDescriptor(path, "PUT", r)))
  )
}

export function patch<
  R,
  PathA,
  CookieA,
  QueryA,
  BodyA,
  HeaderA,
  ReqA extends PathA & QueryA & BodyA,
  ResA = void,
  R2 = unknown,
  PR = unknown
>(
  path: string,
  r: RequestHandler<R, PathA, CookieA, QueryA, BodyA, HeaderA, ReqA, ResA>,
  mw?: Middleware<R, PathA, CookieA, QueryA, BodyA, HeaderA, ReqA, ResA, R2, PR>
) {
  let h = undefined
  if (mw) {
    const { handle, handler } = mw(r)
    r = handler
    h = handle
  }
  return pipe(
    Ex.patch(
      path,
      makeRequestHandler<R, PathA, CookieA, QueryA, BodyA, HeaderA, ReqA, ResA, R2, PR>(
        r,
        h
      )
    ),
    T.zipRight(T.succeedWith(() => makeRouteDescriptor(path, "PATCH", r)))
  )
}

function del<
  R,
  PathA,
  CookieA,
  QueryA,
  BodyA,
  HeaderA,
  ReqA extends PathA & QueryA & BodyA,
  ResA = void,
  R2 = unknown,
  PR = unknown
>(
  path: string,
  r: RequestHandler<R, PathA, CookieA, QueryA, BodyA, HeaderA, ReqA, ResA>,
  mw?: Middleware<R, PathA, CookieA, QueryA, BodyA, HeaderA, ReqA, ResA, R2, PR>
) {
  let h = undefined
  if (mw) {
    const { handle, handler } = mw(r)
    r = handler
    h = handle
  }
  return pipe(
    Ex.delete(
      path,
      makeRequestHandler<R, PathA, CookieA, QueryA, BodyA, HeaderA, ReqA, ResA, R2, PR>(
        r,
        h
      )
    ),
    T.zipRight(T.succeedWith(() => makeRouteDescriptor(path, "DELETE", r)))
  )
}

export { del as delete }

export function makeFromSchema<ResA>(
  e: RouteDescriptor<any, any, any, any, any, any, ResA, any>
) {
  const jsonSchema_ = OpenApi.for
  const jsonSchema = <E, A>(r: S.ReqRes<E, A>) => jsonSchema_(r)
  const { Request: Req, Response: Res_, ResponseOpenApi } = e.handler
  const r = ResponseOpenApi ?? Res_
  const Res = r ? S.extractSchema(r) : S.Void
  // TODO: use the path vs body etc serialisation also in the Client.
  const makeReqQuerySchema = EO.fromNullable(Req.Query)["|>"](
    EO.chainEffect(jsonSchema)
  )
  const makeReqHeadersSchema = EO.fromNullable(Req.Headers)["|>"](
    EO.chainEffect(jsonSchema)
  )
  const makeReqCookieSchema = EO.fromNullable(Req.Cookie)["|>"](
    EO.chainEffect(jsonSchema)
  )
  const makeReqPathSchema = EO.fromNullable(Req.Path)["|>"](EO.chainEffect(jsonSchema))
  const makeReqBodySchema = EO.fromNullable(Req.Body)["|>"](EO.chainEffect(jsonSchema))
  //const makeReqSchema = schema(Req)

  const makeResSchema = jsonSchema_(Res)

  function makeParameters(inn: ParameterLocation) {
    return (a: O.Option<JSONSchema | SubSchema>) => {
      return a["|>"](O.chain((o) => (isObjectSchema(o) ? O.some(o) : O.none)))
        ["|>"](
          O.map((x) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return Object.keys(x.properties!).map((p) => {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              const schema = x.properties![p]
              const required = Boolean(x.required?.includes(p))
              return { name: p, in: inn, required, schema }
            })
          })
        )
        ["|>"](O.getOrElse(() => []))
    }
  }

  return pipe(
    T.struct({
      req: jsonSchema(Req.Model),
      reqQuery: makeReqQuerySchema,
      reqHeaders: makeReqHeadersSchema,
      reqBody: makeReqBodySchema,
      reqPath: makeReqPathSchema,
      reqCookie: makeReqCookieSchema,
      res: makeResSchema,
    }),
    T.map((_) => {
      //console.log("$$$ REQ", _.req)
      const isEmpty = !e.handler.Response || e.handler.Response === S.Void
      return {
        path: e.path,
        method: e.method.toLowerCase(),
        tags: e.info?.tags,
        description: _.req?.description,
        summary: _.req?.summary,
        operationId: _.req?.title,
        parameters: [
          ..._.reqPath["|>"](makeParameters("path")),
          ..._.reqQuery["|>"](makeParameters("query")),
          ..._.reqHeaders["|>"](makeParameters("header")),
          ..._.reqCookie["|>"](makeParameters("cookie")),
        ],
        requestBody: O.toUndefined(
          _.reqBody["|>"](
            O.map((schema) => ({ content: { "application/json": { schema } } }))
          )
        ),
        responses: A.concat_(
          [
            isEmpty
              ? new Response(204, { description: "Empty" })
              : new Response(200, {
                  description: "OK",
                  content: { "application/json": { schema: _.res } },
                }),
            new Response(400, { description: "ValidationError" }),
          ],
          e.path.includes(":") && isEmpty
            ? [new Response(404, { description: "NotFoundError" })]
            : []
        ),
      }
    })
  )
}

class Response {
  constructor(
    public readonly statusCode: number,
    public readonly type: any //string | JSONSchema | SubSchema
  ) {}
}
