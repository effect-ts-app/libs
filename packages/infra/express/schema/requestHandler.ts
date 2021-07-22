/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { makeAssociative } from "@effect-ts/core/Associative"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import * as T from "@effect-ts/core/Effect"
import * as L from "@effect-ts/core/Effect/Layer"
import { flow, pipe } from "@effect-ts/core/Function"
import * as O from "@effect-ts/core/Option"
import * as DSL from "@effect-ts/core/Prelude/DSL"
import * as EU from "@effect-ts/core/Utils"
import * as EO from "@effect-ts-app/core/EffectOption"
import * as MO from "@effect-ts-app/core/Schema"
import { Methods, Parser } from "@effect-ts-app/core/Schema"
import { typedKeysOf } from "@effect-ts-app/core/utils"
import { ValidationError } from "@effect-ts-app/infra/errors"
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

const ValidationApplicative = T.getValidationApplicative(
  makeAssociative<A.Array<{ type: string; errors: ReturnType<typeof decodeErrors> }>>(
    (l, r) => l.concat(r)
  )
)

const structValidation = DSL.structF(ValidationApplicative)

export function parseRequestParams<PathA, CookieA, QueryA, BodyA, HeaderA>(
  parsers: RequestParsers<PathA, CookieA, QueryA, BodyA, HeaderA>
) {
  return ({ body, cookies, headers, params, query }: express.Request) =>
    pipe(
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
      ),
      T.mapError((err) => new ValidationError(err))
    )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapErrors_<E, NE, NER extends Record<string, T.Effect<any, E, any>>>(
  t: NER, // TODO: enforce non empty
  mapErrors: (k: keyof NER) => (err: E) => NE
): {
  [K in keyof NER]: T.Effect<EU._R<NER[K]>, NE, EU._A<NER[K]>>
} {
  return typedKeysOf(t).reduce(
    (prev, cur) => {
      prev[cur] = t[cur]["|>"](T.mapError(mapErrors(cur)))
      return prev
    },
    {} as {
      [K in keyof NER]: T.Effect<EU._R<NER[K]>, NE, EU._A<NER[K]>>
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
    flow(
      encodeResponse(req),
      T.succeed,
      T.chain((r) =>
        T.succeedWith(() => {
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
  h: (i: PathA & QueryA & BodyA & {}) => T.Effect<R, ResE, ResA>
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
  h: (i: PathA & QueryA & BodyA & {}) => T.Effect<R, ResE, ResA>
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
  h: (i: ReqA) => T.Effect<R, ResE, ResA>
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
  handle: (req: express.Request, res: express.Response) => L.Layer<R2, ResE, PR>
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
  const ph = O.fromNullable(Request.Headers)
    ["|>"](O.map((s) => s))
    ["|>"](O.map(Parser.for)) // todo strict
    ["|>"](O.map(MO.condemn))
    ["|>"](EO.fromOption)
  const parseHeaders = (u: unknown) =>
    ph["|>"](EO.chain((d) => d(u)["|>"](EO.fromEffect)))

  const pq = O.fromNullable(Request.Query)
    ["|>"](O.map((s) => s))
    ["|>"](O.map(Parser.for)) // todo strict
    ["|>"](O.map(MO.condemn))
    ["|>"](EO.fromOption)
  const parseQuery = (u: unknown) =>
    pq["|>"](EO.chain((d) => d(u)["|>"](EO.fromEffect)))

  const pb = O.fromNullable(Request.Body)
    ["|>"](O.map((s) => s))
    ["|>"](O.map(Parser.for)) // todo strict
    ["|>"](O.map(MO.condemn))
    ["|>"](EO.fromOption)
  const parseBody = (u: unknown) => pb["|>"](EO.chain((d) => d(u)["|>"](EO.fromEffect)))

  const pp = O.fromNullable(Request.Path)
    ["|>"](O.map((s) => s))
    ["|>"](O.map(Parser.for)) // todo strict
    ["|>"](O.map(MO.condemn))
    ["|>"](EO.fromOption)
  const parsePath = (u: unknown) => pp["|>"](EO.chain((d) => d(u)["|>"](EO.fromEffect)))

  const pc = O.fromNullable(Request.Cookie)
    ["|>"](O.map((s) => s))
    ["|>"](O.map(Parser.for)) // todo strict
    ["|>"](O.map(MO.condemn))
    ["|>"](EO.fromOption)
  const parseCookie = (u: unknown) =>
    pc["|>"](EO.chain((d) => d(u)["|>"](EO.fromEffect)))

  return {
    parseBody,
    parseCookie,
    parseHeaders,
    parsePath,
    parseQuery,
  }
}

type Decode<A> = (u: unknown) => T.IO<unknown, A>

export interface RequestParsers<PathA, CookieA, QueryA, BodyA, HeaderA> {
  parseHeaders: Decode<O.Option<HeaderA>>
  parseQuery: Decode<O.Option<QueryA>>
  parseBody: Decode<O.Option<BodyA>>
  parsePath: Decode<O.Option<PathA>>
  parseCookie: Decode<O.Option<CookieA>>
}
