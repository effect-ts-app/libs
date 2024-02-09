/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/ban-types */
import * as S from "@effect-app/prelude/schema"

import type { EnforceNonEmptyRecord } from "@effect-app/core/utils"
import { ValidationError } from "@effect-app/infra/errors"
import type { REST, StructFields } from "@effect-app/prelude/schema"
import type { Simplify } from "effect/Types"
import type express from "express"
import type { HttpRequestError, HttpRoute } from "../http.js"

export type Flatten<T extends object> = object extends T ? object : {
  [K in keyof T]-?: (
    x: NonNullable<T[K]> extends infer V ? V extends object ? V extends readonly any[] ? Pick<T, K>
        : FlattenLVL1<V> extends infer FV ? ({
            [P in keyof FV as `${Extract<K, string | number>}.${Extract<P, string | number>}`]: FV[P]
          })
        : never
      : Pick<T, K>
      : never
  ) => void
} extends Record<keyof T, (y: infer O) => void> ? O extends unknown /* infer U */ ? { [K in keyof O]: O[K] } : never
: never

type FlattenLVL1<T extends object> = object extends T ? object : {
  [K in keyof T]-?: (
    x: NonNullable<T[K]> extends infer V ? V extends object ? V extends readonly any[] ? Pick<T, K>
          /*: Flatten<V> extends infer FV ? ({
      [P in keyof FV as `${Extract<K, string | number>}.${Extract<P, string | number>}`]: FV[P]
    })
    : never
    */
        : Pick<T, K>
      : never
      : never
  ) => void
} extends Record<keyof T, (y: infer O) => void> ? O extends unknown /* infer U */ ? { [K in keyof O]: O[K] } : never
: never

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
    HttpRoute<Exclude<Exclude<R, EnforceNonEmptyRecord<M>>, PR>, HttpRequestError>
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
}

export type ReqFromSchema<ReqSchema extends S.Schema<any, any, any>> = S.Schema.To<ReqSchema>

export type Extr<T> = T extends { Model: S.Schema<any, any, any> } ? T["Model"]
  : T extends S.Schema<any, any, any> ? T
  : never

export type ResFromSchema<ResSchema> = S.Schema.To<Extr<ResSchema>>

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
  PathA extends StructFields,
  CookieA extends StructFields,
  QueryA extends StructFields,
  BodyA extends StructFields,
  HeaderA extends StructFields
>(
  parsers: RequestParsers<PathA, CookieA, QueryA, BodyA, HeaderA>
) {
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
          .exit
          .flatMap((_) =>
            _.isFailure() && !_.cause.isFailure()
              ? (Effect.failCauseSync(() => _.cause) as Effect<never, ValidationError>)
              : Effect.sync(() =>
                _.isSuccess()
                  ? { _tag: "Success" as const, value: _.value }
                  : { _tag: "Failure", errors: _.cause.failures }
              )
          ),
        cookie: parsers
          .parseCookie(cookies)
          .exit
          .flatMap((_) =>
            _.isFailure() && !_.cause.isFailure()
              ? (Effect.failCauseSync(() => _.cause) as Effect<never, ValidationError>)
              : Effect.sync(() =>
                _.isSuccess()
                  ? { _tag: "Success" as const, value: _.value }
                  : { _tag: "Failure", errors: _.cause.failures }
              )
          ),
        headers: parsers
          .parseHeaders(headers)
          .exit
          .flatMap((_) =>
            _.isFailure() && !_.cause.isFailure()
              ? (Effect.failCauseSync(() => _.cause) as Effect<never, ValidationError>)
              : Effect.sync(() =>
                _.isSuccess()
                  ? { _tag: "Success" as const, value: _.value }
                  : { _tag: "Failure", errors: _.cause.failures }
              )
          ),
        query: parsers
          .parseQuery(query)
          .exit
          .flatMap((_) =>
            _.isFailure() && !_.cause.isFailure()
              ? (Effect.failCauseSync(() => _.cause) as Effect<never, ValidationError>)
              : Effect.sync(() =>
                _.isSuccess()
                  ? { _tag: "Success" as const, value: _.value }
                  : { _tag: "Failure", errors: _.cause.failures }
              )
          ),
        path: parsers
          .parsePath(params)
          .exit
          .flatMap((_) =>
            _.isFailure() && !_.cause.isFailure()
              ? (Effect.failCauseSync(() => _.cause) as Effect<never, ValidationError>)
              : Effect.sync(() =>
                _.isSuccess()
                  ? { _tag: "Success" as const, value: _.value }
                  : { _tag: "Failure", errors: _.cause.failures }
              )
          )
      })
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
    flow(encodeResponse(req), Effect.succeed, (_) =>
      _.flatMap((r) =>
        Effect.sync(() => {
          r === undefined
            ? res.status(204).send()
            : res.status(200).send(JSON.stringify(r))
        })
      ))
}

export function makeRequestParsers<
  R,
  M,
  PathA extends StructFields,
  CookieA extends StructFields,
  QueryA extends StructFields,
  BodyA extends StructFields,
  HeaderA extends StructFields,
  ReqA extends PathA & QueryA & BodyA,
  ResA extends StructFields,
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
      .map((s) => s as unknown as Schema<any>)
      .map(S.decodeUnknown)
  )
  const parseHeaders = (u: unknown) => ph.flatMapOpt((d) => d(u))

  const pq = Effect.sync(() =>
    Option
      .fromNullable(Request.Query)
      .map((s) => s as unknown as Schema<any>)
      .map(S.decodeUnknown)
  )
  const parseQuery = (u: unknown) => pq.flatMapOpt((d) => d(u))

  const pb = Effect.sync(() =>
    Option
      .fromNullable(Request.Body)
      .map((s) => s as unknown as Schema<any>)
      .map(S.decodeUnknown)
  )
  const parseBody = (u: unknown) => pb.flatMapOpt((d) => d(u))

  const pp = Effect.sync(() =>
    Option
      .fromNullable(Request.Path)
      .map((s) => s as unknown as Schema<any>)
      .map(S.decodeUnknown)
  )
  const parsePath = (u: unknown) => pp.flatMapOpt((d) => d(u))

  const pc = Effect.sync(() =>
    Option
      .fromNullable(Request.Cookie)
      .map((s) => s as unknown as Schema<any>)
      .map(S.decodeUnknown)
  )
  const parseCookie = (u: unknown) => pc.flatMapOpt((d) => d(u))

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
  PathA extends StructFields,
  CookieA extends StructFields,
  QueryA extends StructFields,
  BodyA extends StructFields,
  HeaderA extends StructFields
> {
  parseHeaders: Decode<Option<Simplify<S.ToStruct<HeaderA>>>>
  parseQuery: Decode<Option<Simplify<S.ToStruct<QueryA>>>>
  parseBody: Decode<Option<Simplify<S.ToStruct<BodyA>>>>
  parsePath: Decode<Option<Simplify<S.ToStruct<PathA>>>>
  parseCookie: Decode<Option<Simplify<S.ToStruct<CookieA>>>>
}

export type EffectDeps<A> = {
  [K in keyof A as A[K] extends Effect<any, any, any> ? K : never]: A[K] extends Effect<any, any, any> ? A[K] : never
}

export type Request<
  M,
  PathA extends StructFields,
  CookieA extends StructFields,
  QueryA extends StructFields,
  BodyA extends StructFields,
  HeaderA extends StructFields,
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
  Tag: Tag<M, M>
  ReqA?: ReqA
}

export interface RequestHandlerBase<
  R,
  M,
  PathA extends StructFields,
  CookieA extends StructFields,
  QueryA extends StructFields,
  BodyA extends StructFields,
  HeaderA extends StructFields,
  ReqA extends PathA & QueryA & BodyA,
  ResA extends StructFields,
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
}

export interface RequestHandler<
  R,
  M,
  PathA extends StructFields,
  CookieA extends StructFields,
  QueryA extends StructFields,
  BodyA extends StructFields,
  HeaderA extends StructFields,
  ReqA extends PathA & QueryA & BodyA,
  ResA extends StructFields,
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
  Context: Context
}

export interface RequestHandlerOrig<
  R,
  M,
  PathA extends StructFields,
  CookieA extends StructFields,
  QueryA extends StructFields,
  BodyA extends StructFields,
  HeaderA extends StructFields,
  ReqA extends PathA & QueryA & BodyA,
  ResA extends StructFields,
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
