/* eslint-disable @typescript-eslint/no-explicit-any */
import { pipe } from "@effect-ts/core/Function"
import * as EO from "@effect-ts-app/core/EffectOption"
import * as MO from "@effect-ts-app/core/Schema"
import { Methods } from "@effect-ts-app/core/Schema"
import * as TUP from "@effect-ts-app/core/Tuple"
import { Tuple } from "@effect-ts-app/core/Tuple"

import {
  isObjectSchema,
  JSONSchema,
  ParameterLocation,
  SubSchema,
} from "../../Openapi/atlas-plutus/index.js"
import * as OpenApi from "../../Openapi/index.js"
import { RequestHandler, RequestHandlerOptRes } from "./requestHandler.js"

export function asRouteDescriptionAny<R extends RouteDescriptorAny>(i: R) {
  return i as RouteDescriptorAny
}

export function tupAsRouteDescriptionAny<R extends RouteDescriptorAny>(
  tup: Tuple<ROArray<R>>
) {
  return TUP.map_(tup, asRouteDescriptionAny)
}

export function arrAsRouteDescriptionAny<R extends RouteDescriptorAny>(
  arr: ROArray<R>
) {
  return ROArray.map_(arr, asRouteDescriptionAny)
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
  Errors,
  METHOD extends Methods = Methods
> {
  path: string
  method: METHOD
  handler: RequestHandler<R, PathA, CookieA, QueryA, BodyA, HeaderA, ReqA, ResA, Errors>
  info?: {
    tags: ROArray<string>
  }
}

export type RouteDescriptorAny = RouteDescriptor<
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
>

export function makeRouteDescriptor<
  R,
  PathA,
  CookieA,
  QueryA,
  BodyA,
  HeaderA,
  ReqA extends PathA & QueryA & BodyA,
  ResA = void,
  Errors = any,
  METHOD extends Methods = Methods
>(
  path: string,
  method: METHOD,
  handler: RequestHandlerOptRes<
    R,
    PathA,
    CookieA,
    QueryA,
    BodyA,
    HeaderA,
    ReqA,
    ResA,
    Errors
  >
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
    Errors,
    METHOD
  >
}

export function makeFromSchema<ResA>(
  e: RouteDescriptor<any, any, any, any, any, any, ResA, any, any>
) {
  const jsonSchema_ = OpenApi.for
  const jsonSchema = <E, A>(r: MO.ReqRes<E, A>) => jsonSchema_(r)
  const { Request: Req, Response: Res_, ResponseOpenApi } = e.handler
  const r = ResponseOpenApi ?? Res_
  const Res = r ? MO.extractSchema(r) : MO.Void
  // TODO: use the path vs body etc serialisation also in the Client.
  const makeReqQuerySchema = EO.fromNullable(Req.Query).chainOptionEffect(jsonSchema)
  const makeReqHeadersSchema = EO.fromNullable(Req.Headers).chainOptionEffect(
    jsonSchema
  )
  const makeReqCookieSchema = EO.fromNullable(Req.Cookie).chainOptionEffect(jsonSchema)
  const makeReqPathSchema = EO.fromNullable(Req.Path).chainOptionEffect(jsonSchema)
  const makeReqBodySchema = EO.fromNullable(Req.Body).chainOptionEffect(jsonSchema)
  //const makeReqSchema = schema(Req)

  const makeResSchema = jsonSchema_(Res)

  function makeParameters(inn: ParameterLocation) {
    return (a: Option<JSONSchema | SubSchema>) => {
      return pipe(
        a,
        Option.chain((o) => (isObjectSchema(o) ? Option.some(o) : Option.none)),
        Option.map((x) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          return Object.keys(x.properties!).map((p) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const schema = x.properties![p]
            const required = Boolean(x.required?.includes(p))
            return { name: p, in: inn, required, schema }
          })
        }),
        Option.getOrElse(() => [])
      )
    }
  }

  return pipe(
    Effect.struct({
      req: jsonSchema(Req.Model),
      reqQuery: makeReqQuerySchema,
      reqHeaders: makeReqHeadersSchema,
      reqBody: makeReqBodySchema,
      reqPath: makeReqPathSchema,
      reqCookie: makeReqCookieSchema,
      res: makeResSchema,
    }),
    Effect.map((_) => {
      //console.log("$$$ REQ", _.req)
      const isEmpty = !e.handler.Response || e.handler.Response === MO.Void
      return {
        path: e.path,
        method: e.method.toLowerCase(),
        tags: e.info?.tags,
        description: _.req?.description,
        summary: _.req?.summary,
        operationId: _.req?.title,
        parameters: [
          ..._.reqPath.pipe(makeParameters("path")),
          ..._.reqQuery.pipe(makeParameters("query")),
          ..._.reqHeaders.pipe(makeParameters("header")),
          ..._.reqCookie.pipe(makeParameters("cookie")),
        ],
        requestBody: _.reqBody
          .map((schema) => ({ content: { "application/json": { schema } } }))
          .toUndefined(),
        responses: ROArray.concat_(
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
