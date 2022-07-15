/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { makeAssociative } from "@effect-ts/core/Associative"
import { flow } from "@effect-ts/core/Function"
import * as DSL from "@effect-ts/core/Prelude/DSL"
import * as EU from "@effect-ts/core/Utils"
import { typedKeysOf } from "@effect-ts-app/core/utils"
import { ValidationError } from "@effect-ts-app/infra/errors"
import * as MO from "@effect-ts-app/schema"
import { Methods, Parser } from "@effect-ts-app/schema"
import express from "express"

export type Request<
  PathA,
  CookieA,
  QueryA,
  BodyA,
  HeaderA,
  ReqA extends PathA & QueryA & BodyA
> = MO.ReqResSchemed<unknown, ReqA> & {
  method: Methods
  path: string
  Cookie?: MO.ReqRes<Record<string, string>, CookieA>
  Path?: MO.ReqRes<Record<string, string>, PathA>
  Body?: MO.ReqRes<unknown, BodyA>
  Query?: MO.ReqRes<Record<string, string>, QueryA>
  Headers?: MO.ReqRes<Record<string, string>, HeaderA>
}

export type Request2<
  Path extends string,
  Method extends Methods,
  ReqA
> = MO.ReqResSchemed<unknown, ReqA> & {
  method: Method
  path: Path
}

export type Encode<A, E> = (a: A) => E

// function getErrorMessage(current: ContextEntry) {
//   switch (current.type.name) {
//     case "NonEmptyString":
//       return "Must not be empty"
//   }
//   if (current.type.name?.startsWith("NonEmptyArray<")) {
//     return "Must not be empty"
//   }
//   return `Invalid value specified`
// }
export function decodeErrors(x: unknown) {
  return [x]
}

const ValidationApplicative = Effect.getValidationApplicative(
  makeAssociative<ROArray<{ type: string; errors: ReturnType<typeof decodeErrors> }>>(
    (l, r) => l.concat(r)
  )
)

const structValidation = DSL.structF(ValidationApplicative)

export function parseRequestParams<PathA, CookieA, QueryA, BodyA, HeaderA>(
  parsers: RequestParsers<PathA, CookieA, QueryA, BodyA, HeaderA>
) {
  return ({ body, cookies, headers, params, query }: express.Request) =>
    structValidation(
      mapErrors_(
        {
          body: parsers.parseBody(body),
          cookie: parsers.parseCookie(cookies),
          headers: parsers.parseHeaders(headers),
          query: parsers.parseQuery(query),
          path: parsers.parsePath(params),
        },
        makeError
      )
    ).mapError((err) => new ValidationError(err))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapErrors_<E, NE, NER extends Record<string, Effect<any, E, any>>>(
  t: NER, // TODO: enforce non empty
  mapErrors: (k: keyof NER) => (err: E) => NE
): {
  [K in keyof NER]: Effect<EU._R<NER[K]>, NE, EU._A<NER[K]>>
} {
  return typedKeysOf(t).reduce(
    (prev, cur) => {
      prev[cur] = t[cur].mapError(mapErrors(cur))
      return prev
    },
    {} as {
      [K in keyof NER]: Effect<EU._R<NER[K]>, NE, EU._A<NER[K]>>
    }
  )
}

function makeError(type: string) {
  return (e: unknown) => [{ type, errors: decodeErrors(e) }]
}

export function respondSuccess<ReqA, A, E>(
  encodeResponse: (req: ReqA) => Encode<A, E>
) {
  return (req: ReqA, res: express.Response) =>
    flow(encodeResponse(req), Effect.succeed, (_) =>
      _.chain((r) =>
        Effect.succeedWith(() => {
          r === undefined
            ? res.status(204).send()
            : res.status(200).send(r === null ? JSON.stringify(null) : r)
        })
      )
    )
}

export interface RequestHandlerOptRes<
  R,
  PathA,
  CookieA,
  QueryA,
  BodyA,
  HeaderA,
  ReqA extends PathA & QueryA & BodyA,
  ResA,
  ResE
> {
  adaptResponse?: any
  h: (i: PathA & QueryA & BodyA & {}) => Effect<R, ResE, ResA>
  Request: Request<PathA, CookieA, QueryA, BodyA, HeaderA, ReqA>
  Response?: MO.ReqRes<unknown, ResA> | MO.ReqResSchemed<unknown, ResA>
}

export interface RequestHandler<
  R,
  PathA,
  CookieA,
  QueryA,
  BodyA,
  HeaderA,
  ReqA extends PathA & QueryA & BodyA,
  ResA,
  ResE
> {
  adaptResponse?: any
  h: (i: PathA & QueryA & BodyA & {}) => Effect<R, ResE, ResA>
  Request: Request<PathA, CookieA, QueryA, BodyA, HeaderA, ReqA>
  Response: MO.ReqRes<unknown, ResA> | MO.ReqResSchemed<unknown, ResA>
  ResponseOpenApi?: any
}

export interface RequestHandler2<
  R,
  Path extends string,
  Method extends Methods,
  ReqA,
  ResA,
  ResE
> {
  h: (i: ReqA) => Effect<R, ResE, ResA>
  Request: Request2<Path, Method, ReqA>
  Response: MO.ReqRes<unknown, ResA> | MO.ReqResSchemed<unknown, ResA>
}

export type Middleware<
  R,
  PathA,
  CookieA,
  QueryA,
  BodyA,
  HeaderA,
  ReqA extends PathA & QueryA & BodyA,
  ResA,
  ResE,
  R2 = unknown,
  PR = unknown
> = (
  handler: RequestHandler<R, PathA, CookieA, QueryA, BodyA, HeaderA, ReqA, ResA, ResE>
) => {
  handler: typeof handler
  handle: (req: express.Request, res: express.Response) => Layer<R2, ResE, PR>
}

export type Middleware2<R, ReqA, ResA, R2 = unknown, PR = unknown> = Middleware<
  R,
  any,
  any,
  any,
  any,
  any,
  ReqA,
  ResA,
  any,
  R2,
  PR
>

export function makeRequestParsers<
  R,
  PathA,
  CookieA,
  QueryA,
  BodyA,
  HeaderA,
  ReqA extends PathA & QueryA & BodyA,
  ResA,
  Errors
>(
  Request: RequestHandler<
    R,
    PathA,
    CookieA,
    QueryA,
    BodyA,
    HeaderA,
    ReqA,
    ResA,
    Errors
  >["Request"]
): RequestParsers<PathA, CookieA, QueryA, BodyA, HeaderA> {
  const ph =
    Option.fromNullable(Request.Headers)
      .map((s) => s)
      .map(Parser.for)
      .map(MO.condemn) >= EffectOption.fromOption
  const parseHeaders = (u: unknown) =>
    ph.flatMapOption((d) => d(u) >= EffectOption.fromEffect)

  const pq =
    Option.fromNullable(Request.Query)
      .map((s) => s)
      .map(Parser.for)
      .map(MO.condemn) >= EffectOption.fromOption
  const parseQuery = (u: unknown) =>
    pq.flatMapOption((d) => d(u) >= EffectOption.fromEffect)

  const pb =
    Option.fromNullable(Request.Body)
      .map((s) => s)
      .map(Parser.for)
      .map(MO.condemn) >= EffectOption.fromOption
  const parseBody = (u: unknown) =>
    pb.flatMapOption((d) => d(u) >= EffectOption.fromEffect)

  const pp =
    Option.fromNullable(Request.Path)
      .map((s) => s)
      .map(Parser.for)
      .map(MO.condemn) >= EffectOption.fromOption
  const parsePath = (u: unknown) =>
    pp.flatMapOption((d) => d(u) >= EffectOption.fromEffect)

  const pc =
    Option.fromNullable(Request.Cookie)
      .map((s) => s)
      .map(Parser.for)
      .map(MO.condemn) >= EffectOption.fromOption
  const parseCookie = (u: unknown) =>
    pc.flatMapOption((d) => d(u) >= EffectOption.fromEffect)

  return {
    parseBody,
    parseCookie,
    parseHeaders,
    parsePath,
    parseQuery,
  }
}

type Decode<A> = (u: unknown) => Effect.IO<unknown, A>

export interface RequestParsers<PathA, CookieA, QueryA, BodyA, HeaderA> {
  parseHeaders: Decode<Option<HeaderA>>
  parseQuery: Decode<Option<QueryA>>
  parseBody: Decode<Option<BodyA>>
  parsePath: Decode<Option<PathA>>
  parseCookie: Decode<Option<CookieA>>
}
