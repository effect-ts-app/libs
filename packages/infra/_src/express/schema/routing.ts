/* eslint-disable @typescript-eslint/no-explicit-any */
import * as MO from "@effect-ts-app/schema"
import { Methods } from "@effect-ts-app/schema"

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
  // TODO EffectMaybe.fromNullable(Req.Headers).flatMapMaybe(jsonSchema)
  // TODO: use the path vs body etc serialisation also in the Client.
  const makeReqQuerySchema = Effect(Maybe.fromNullable(Req.Query)).flatMap((_) =>
    _.fold(
      () => Effect(Maybe.none),
      (_) => jsonSchema(_).map(Maybe.some)
    )
  )
  const makeReqHeadersSchema = Effect(Maybe.fromNullable(Req.Headers)).flatMap((_) =>
    _.fold(
      () => Effect(Maybe.none),
      (_) => jsonSchema(_).map(Maybe.some)
    )
  )
  const makeReqCookieSchema = Effect(Maybe.fromNullable(Req.Cookie)).flatMap((_) =>
    _.fold(
      () => Effect(Maybe.none),
      (_) => jsonSchema(_).map(Maybe.some)
    )
  )
  const makeReqPathSchema = Effect(Maybe.fromNullable(Req.Path)).flatMap((_) =>
    _.fold(
      () => Effect(Maybe.none),
      (_) => jsonSchema(_).map(Maybe.some)
    )
  )
  const makeReqBodySchema = Effect(Maybe.fromNullable(Req.Body)).flatMap((_) =>
    _.fold(
      () => Effect(Maybe.none),
      (_) => jsonSchema(_).map(Maybe.some)
    )
  )
  //const makeReqSchema = schema(Req)

  const makeResSchema = jsonSchema_(Res)

  function makeParameters(inn: ParameterLocation) {
    return (a: Maybe<JSONSchema | SubSchema>) => {
      return a
        .flatMap((o) => (isObjectSchema(o) ? Maybe.some(o) : Maybe.none))
        .map((x) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          return Object.keys(x.properties!).map((p) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const schema = x.properties![p]
            const required = Boolean(x.required?.includes(p))
            return { name: p, in: inn, required, schema }
          })
        })
        .getOrElse(() => [])
    }
  }

  return Effect.struct({
    req: jsonSchema(Req.Model),
    reqQuery: makeReqQuerySchema,
    reqHeaders: makeReqHeadersSchema,
    reqBody: makeReqBodySchema,
    reqPath: makeReqPathSchema,
    reqCookie: makeReqCookieSchema,
    res: makeResSchema,
  }).map((_) => {
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
        ...makeParameters("path")(_.reqPath),
        ...makeParameters("query")(_.reqQuery),
        ...makeParameters("header")(_.reqHeaders),
        ...makeParameters("cookie")(_.reqCookie),
      ],
      requestBody: _.reqBody.map((schema) => ({
        content: { "application/json": { schema } },
      })).value,
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
}

class Response {
  constructor(
    public readonly statusCode: number,
    public readonly type: any //string | JSONSchema | SubSchema
  ) {}
}
