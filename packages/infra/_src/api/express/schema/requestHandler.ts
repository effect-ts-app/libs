/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import * as MO from "@effect-app/schema"
import type { Methods } from "@effect-app/schema"
import { Parser } from "@effect-app/schema"
import type express from "express"
import { ValidationError } from "../../../errors.js"

export type _R<T extends Effect<any, any, any>> = [T] extends [
  Effect<infer R, any, any>
] ? R
  : never

export type _E<T extends Effect<any, any, any>> = [T] extends [
  Effect<any, infer E, any>
] ? E
  : never

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
//   if (current.type.name?.startsWith("NonEmptyReadonlyArray<")) {
//     return "Must not be empty"
//   }
//   return `Invalid value specified`
// }
export function decodeErrors(x: unknown) {
  return [x]
}

// const ValidationApplicative = Effect.getValidationApplicative(
//   makeAssociative<ReadonlyArray<{ type: string; errors: ReturnType<typeof decodeErrors> }>>(
//     (l, r) => l.concat(r)
//   )
// )

// const structValidation = DSL.structF(ValidationApplicative)
export function parseRequestParams<PathA, CookieA, QueryA, BodyA, HeaderA>(
  parsers: RequestParsers<PathA, CookieA, QueryA, BodyA, HeaderA>
) {
  return ({ body, cookies, headers, params, query }: express.Request) =>
    Effect.struct({
      body: parsers
        .parseBody(body)
        .exit.flatMap(_ =>
          _.isFailure() && !_.cause.isFailure()
            ? (Effect.failCauseSync(() => _.cause) as Effect<never, ValidationError, never>)
            : Effect(
              _.isSuccess()
                ? { _tag: "Success" as const, value: _.value }
                : { _tag: "Failure", errors: _.cause.failures }
            )
        ),
      cookie: parsers
        .parseCookie(cookies)
        .exit.flatMap(_ =>
          _.isFailure() && !_.cause.isFailure()
            ? (Effect.failCauseSync(() => _.cause) as Effect<never, ValidationError, never>)
            : Effect(
              _.isSuccess()
                ? { _tag: "Success" as const, value: _.value }
                : { _tag: "Failure", errors: _.cause.failures }
            )
        ),
      headers: parsers
        .parseHeaders(headers)
        .exit.flatMap(_ =>
          _.isFailure() && !_.cause.isFailure()
            ? (Effect.failCauseSync(() => _.cause) as Effect<never, ValidationError, never>)
            : Effect(
              _.isSuccess()
                ? { _tag: "Success" as const, value: _.value }
                : { _tag: "Failure", errors: _.cause.failures }
            )
        ),
      query: parsers
        .parseQuery(query)
        .exit.flatMap(_ =>
          _.isFailure() && !_.cause.isFailure()
            ? (Effect.failCauseSync(() => _.cause) as Effect<never, ValidationError, never>)
            : Effect(
              _.isSuccess()
                ? { _tag: "Success" as const, value: _.value }
                : { _tag: "Failure", errors: _.cause.failures }
            )
        ),
      path: parsers
        .parsePath(params)
        .exit.flatMap(_ =>
          _.isFailure() && !_.cause.isFailure()
            ? (Effect.failCauseSync(() => _.cause) as Effect<never, ValidationError, never>)
            : Effect(
              _.isSuccess()
                ? { _tag: "Success" as const, value: _.value }
                : { _tag: "Failure", errors: _.cause.failures }
            )
        )
    }).flatMap(({ body, cookie, headers, path, query }) => {
      const errors: unknown[] = []
      if (body._tag === "Failure") {
        errors.push(makeError("body")(body.errors))
      }
      if (cookie._tag === "Failure") {
        errors.push(makeError("cookie")(cookie.errors))
      }
      if (headers._tag === "Failure") {
        errors.push(makeError("headers")(headers.errors))
      }
      if (path._tag === "Failure") {
        errors.push(makeError("path")(path.errors))
      }
      if (query._tag === "Failure") {
        errors.push(makeError("query")(query.errors))
      }
      if (errors.length) {
        return Effect.fail(new ValidationError(errors))
      }
      return Effect({
        body: body.value!,
        cookie: cookie.value!,
        headers: headers.value!,
        path: path.value!,
        query: query.value!
      })
    })
}

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// function mapErrors_<E, NE, NER extends Record<string, Effect<any, E, any>>>(
//   t: NER, // TODO: enforce non empty
//   mapErrors: (k: keyof NER) => (err: E) => NE
// ): {
//   [K in keyof NER]: Effect<_R<NER[K]>, NE, Effect.Success<NER[K]>>
// } {
//   return typedKeysOf(t).reduce(
//     (prev, cur) => {
//       prev[cur] = t[cur].mapError(mapErrors(cur))
//       return prev
//     },
//     {} as {
//       [K in keyof NER]: Effect<_R<NER[K]>, NE, Effect.Success<NER[K]>>
//     }
//   )
// }

function makeError(type: string) {
  return (e: unknown) => [{ type, errors: decodeErrors(e) }]
}

export function respondSuccess<ReqA, A, E>(
  encodeResponse: (req: ReqA) => Encode<A, E>
) {
  return (req: ReqA, res: express.Response) =>
    flow(encodeResponse(req), Effect.succeed, _ =>
      _.flatMap(r =>
        Effect.sync(() => {
          r === undefined
            ? res.status(204).send()
            : res.status(200).send(r === null ? JSON.stringify(null) : r)
        })
      ))
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

export type MiddlewareHandler<ResE, R2 = never, PR = never> = (
  req: express.Request,
  res: express.Response
) => Layer<R2, ResE, PR>

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
  R2 = never,
  PR = never
> = (
  handler: RequestHandler<R, PathA, CookieA, QueryA, BodyA, HeaderA, ReqA, ResA, ResE>
) => {
  handler: typeof handler
  handle: MiddlewareHandler<ResE, R2, PR>
}

export type Middleware2<R, ReqA, ResA, R2 = never, PR = never> = Middleware<
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
  const ph = Effect(
    Option.fromNullable(Request.Headers)
      .map(s => s)
      .map(Parser.for)
      .map(MO.condemn)
  )
  const parseHeaders = (u: unknown) => ph.flatMapOpt(d => d(u))

  const pq = Effect(
    Option.fromNullable(Request.Query)
      .map(s => s)
      .map(Parser.for)
      .map(MO.condemn)
  )
  const parseQuery = (u: unknown) => pq.flatMapOpt(d => d(u))

  const pb = Effect(
    Option.fromNullable(Request.Body)
      .map(s => s)
      .map(Parser.for)
      .map(MO.condemn)
  )
  const parseBody = (u: unknown) => pb.flatMapOpt(d => d(u))

  const pp = Effect(
    Option.fromNullable(Request.Path)
      .map(s => s)
      .map(Parser.for)
      .map(MO.condemn)
  )
  const parsePath = (u: unknown) => pp.flatMapOpt(d => d(u))

  const pc = Effect(
    Option.fromNullable(Request.Cookie)
      .map(s => s)
      .map(Parser.for)
      .map(MO.condemn)
  )
  const parseCookie = (u: unknown) => pc.flatMapOpt(d => d(u))

  return {
    parseBody,
    parseCookie,
    parseHeaders,
    parsePath,
    parseQuery
  }
}

type Decode<A> = (u: unknown) => Effect<never, unknown, A>

export interface RequestParsers<PathA, CookieA, QueryA, BodyA, HeaderA> {
  parseHeaders: Decode<Option<HeaderA>>
  parseQuery: Decode<Option<QueryA>>
  parseBody: Decode<Option<BodyA>>
  parsePath: Decode<Option<PathA>>
  parseCookie: Decode<Option<CookieA>>
}
