/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/ban-types */
import type { EnforceNonEmptyRecord } from "@effect-app/core/utils"
import { ValidationError } from "@effect-app/infra/errors"
import type { Struct } from "@effect/schema/Schema"
import * as S from "@effect/schema/Schema"
import type { Context } from "effect-app"
import { Cause, Effect, Exit, Option } from "effect-app"
import type { HttpRouter, HttpServerError } from "effect-app/http"
import type { REST } from "effect-app/schema"
import type { Simplify } from "effect/Types"

export type RouteMatch<
  R,
  M,
  PR = never
> // RErr = never,
 = // PathA,
  // CookieA,
  // QueryA,
  // BodyA,
  // HeaderA,
  // ReqA extends PathA & QueryA & BodyA,
  // ResA,
  // PR = never
  Effect<
    // RouteDescriptor<R, PathA, CookieA, QueryA, BodyA, HeaderA, ReqA, ResA, SupportedErrors, Methods>
    HttpRouter.Route<Exclude<Exclude<R, EnforceNonEmptyRecord<M>>, PR>, HttpServerError.RequestError>
  >

export interface ReqHandler<
  Req,
  R,
  E,
  Res,
  ReqSchema extends S.Schema<any, any, any>,
  ResSchema extends S.Schema<any, any, any>,
  CTX = any,
  Context = any
> {
  h: (r: Req, ctx: CTX) => Effect<Res, E, R>
  Request: ReqSchema
  Response: ResSchema
  ResponseOpenApi: any
  name: string
  CTX: CTX
  Context: Context
  rt: "raw" | "d"
}

export type ReqFromSchema<ReqSchema extends S.Schema<any, any, any>> = S.Schema.Type<ReqSchema>

export type Extr<T> = T extends { Model: S.Schema<any, any, any> } ? T["Model"]
  : T extends S.Schema<any, any, any> ? T
  : never

export type ResFromSchema<ResSchema> = S.Schema.Type<Extr<ResSchema>>

export type _R<T extends Effect<any, any, any>> = [T] extends [
  Effect<any, any, infer R>
] ? R
  : never

export type _E<T extends Effect<any, any, any>> = [T] extends [
  Effect<any, infer E, any>
] ? E
  : never

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
export function parseRequestParams<
  PathA extends Struct.Fields,
  CookieA extends Struct.Fields,
  QueryA extends Struct.Fields,
  BodyA extends Struct.Fields,
  HeaderA extends Struct.Fields
>(
  parsers: RequestParsers<PathA, CookieA, QueryA, BodyA, HeaderA>
) {
  const handleParse = <A, E, R>(effect: Effect<A, E, R>) =>
    effect.pipe(
      Effect.exit,
      Effect
        .flatMap((_) =>
          Exit.isFailure(_) && !Cause.isFailure(_.cause)
            ? (Effect.failCauseSync(() => _.cause) as Effect<never, ValidationError>)
            : Effect.sync(() =>
              Exit.isSuccess(_)
                ? { _tag: "Success" as const, value: _.value }
                : { _tag: "Failure", errors: Cause.failures(_.cause) }
            )
        )
    )
  return (
    { body, cookies, headers, params, query }: {
      body: unknown
      cookies: unknown
      headers: unknown
      params: unknown
      query: unknown
    }
  ) =>
    Effect
      .all({
        body: parsers
          .parseBody(body)
          .pipe(handleParse),
        cookie: parsers
          .parseCookie(cookies)
          .pipe(handleParse),
        headers: parsers
          .parseHeaders(headers)
          .pipe(handleParse),
        query: parsers
          .parseQuery(query)
          .pipe(handleParse),
        path: parsers
          .parsePath(params)
          .pipe(handleParse)
      })
      .pipe(Effect
        .flatMap(({ body, cookie, headers, path, query }) => {
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
            return new ValidationError({ errors })
          }
          return Effect.sync(() => ({
            body: body.value!,
            cookie: cookie.value!,
            headers: headers.value!,
            path: path.value!,
            query: query.value!
          }))
        }))
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

export function makeRequestParsers<
  R,
  M,
  PathA extends Struct.Fields,
  CookieA extends Struct.Fields,
  QueryA extends Struct.Fields,
  BodyA extends Struct.Fields,
  HeaderA extends Struct.Fields,
  ReqA extends PathA & QueryA & BodyA,
  ResA extends Struct.Fields,
  Errors,
  PPath extends `/${string}`,
  CTX,
  Context,
  Config
>(
  Request: RequestHandler<
    R,
    M,
    PathA,
    CookieA,
    QueryA,
    BodyA,
    HeaderA,
    ReqA,
    ResA,
    Errors,
    PPath,
    CTX,
    Context,
    Config
  >["Request"]
): RequestParsers<PathA, CookieA, QueryA, BodyA, HeaderA> {
  const ph = Effect.sync(() =>
    Option
      .fromNullable(Request.Headers)
      .pipe(
        Option.map((s) => s as unknown as S.Schema<any>),
        Option.map(S.decodeUnknown)
      )
  )
  const parseHeaders = (u: unknown) => Effect.flatMapOption(ph, (d) => d(u))

  const pq = Effect.sync(() =>
    Option
      .fromNullable(Request.Query)
      .pipe(
        Option.map((s) => s as unknown as S.Schema<any>),
        Option.map(S.decodeUnknown)
      )
  )
  const parseQuery = (u: unknown) => Effect.flatMapOption(pq, (d) => d(u))

  const pb = Effect.sync(() =>
    Option
      .fromNullable(Request.Body)
      .pipe(
        Option.map((s) => s as unknown as S.Schema<any>),
        Option.map(S.decodeUnknown)
      )
  )
  const parseBody = (u: unknown) => Effect.flatMapOption(pb, (d) => d(u))

  const pp = Effect.sync(() =>
    Option
      .fromNullable(Request.Path)
      .pipe(
        Option.map((s) => s as unknown as S.Schema<any>),
        Option.map(S.decodeUnknown)
      )
  )
  const parsePath = (u: unknown) => Effect.flatMapOption(pp, (d) => d(u))

  const pc = Effect.sync(() =>
    Option
      .fromNullable(Request.Cookie)
      .pipe(
        Option.map((s) => s as unknown as S.Schema<any>),
        Option.map(S.decodeUnknown)
      )
  )
  const parseCookie = (u: unknown) => Effect.flatMapOption(pc, (d) => d(u))

  return {
    parseBody,
    parseCookie,
    parseHeaders,
    parsePath,
    parseQuery
  }
}

type Decode<A> = (u: unknown) => Effect<A, unknown>

export interface RequestParsers<
  PathA extends Struct.Fields,
  CookieA extends Struct.Fields,
  QueryA extends Struct.Fields,
  BodyA extends Struct.Fields,
  HeaderA extends Struct.Fields
> {
  parseHeaders: Decode<Option<Simplify<S.Struct.Type<HeaderA>>>>
  parseQuery: Decode<Option<Simplify<S.Struct.Type<QueryA>>>>
  parseBody: Decode<Option<Simplify<S.Struct.Type<BodyA>>>>
  parsePath: Decode<Option<Simplify<S.Struct.Type<PathA>>>>
  parseCookie: Decode<Option<Simplify<S.Struct.Type<CookieA>>>>
}

export type EffectDeps<A> = {
  [K in keyof A as A[K] extends Effect<any, any, any> ? K : never]: A[K] extends Effect<any, any, any> ? A[K] : never
}

export type Request<
  M,
  PathA extends Struct.Fields,
  CookieA extends Struct.Fields,
  QueryA extends Struct.Fields,
  BodyA extends Struct.Fields,
  HeaderA extends Struct.Fields,
  ReqA extends PathA & QueryA & BodyA,
  PPath extends `/${string}`
> = REST.ReqRes<any, any, any> & {
  method: REST.Methods.Rest
  path: PPath
  Cookie?: CookieA
  Path?: PathA
  Body?: BodyA
  Query?: QueryA
  Headers?: HeaderA
  Tag: Context.Tag<M, M>
  ReqA?: ReqA
}

export interface RequestHandlerBase<
  R,
  M,
  PathA extends Struct.Fields,
  CookieA extends Struct.Fields,
  QueryA extends Struct.Fields,
  BodyA extends Struct.Fields,
  HeaderA extends Struct.Fields,
  ReqA extends PathA & QueryA & BodyA,
  ResA extends Struct.Fields,
  ResE,
  PPath extends `/${string}`,
  Config
> {
  adaptResponse?: any
  h: (i: PathA & QueryA & BodyA & {}) => Effect<ResA, ResE, R>
  Request: Request<M, PathA, CookieA, QueryA, BodyA, HeaderA, ReqA, PPath>
  Response: REST.ReqRes<any, any, any>
  ResponseOpenApi?: any
  config: Config
  name: string
  rt: "raw" | "d"
}

export interface RequestHandler<
  R,
  M,
  PathA extends Struct.Fields,
  CookieA extends Struct.Fields,
  QueryA extends Struct.Fields,
  BodyA extends Struct.Fields,
  HeaderA extends Struct.Fields,
  ReqA extends PathA & QueryA & BodyA,
  ResA extends Struct.Fields,
  ResE,
  PPath extends `/${string}`,
  CTX,
  Context,
  Config
> {
  adaptResponse?: any
  h: (i: PathA & QueryA & BodyA & {}, ctx: any /* TODO */) => Effect<ResA, ResE, R>
  Request: Request<M, PathA, CookieA, QueryA, BodyA, HeaderA, ReqA, PPath> & Config
  Response: REST.ReqRes<any, any, any>
  ResponseOpenApi?: any
  name: string
  CTX: CTX
  rt: "raw" | "d"
  Context: Context
}

export interface RequestHandlerOrig<
  R,
  M,
  PathA extends Struct.Fields,
  CookieA extends Struct.Fields,
  QueryA extends Struct.Fields,
  BodyA extends Struct.Fields,
  HeaderA extends Struct.Fields,
  ReqA extends PathA & QueryA & BodyA,
  ResA extends Struct.Fields,
  ResE,
  PPath extends `/${string}`
> {
  adaptResponse?: any
  h: (i: PathA & QueryA & BodyA & {}) => Effect<ResA, ResE, R>
  Request: Request<M, PathA, CookieA, QueryA, BodyA, HeaderA, ReqA, PPath>
  Response: REST.ReqRes<any, any, any>
  name: string
  ResponseOpenApi?: any
}
