/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Path } from "path-parser"

import type { ReadMethods, WriteMethods } from "./Methods.js"
import type * as Methods from "./Methods.js"

import type { FromStruct, StructFields, ToStruct } from "@effect/schema/Schema"
import { pipe } from "effect"
import { Tag } from "effect/Context"
import type { Class } from "effect/Effectable"
import type { Simplify } from "effect/Types"
import { S } from "./schema.js"

export type StringRecord = Record<string, string>

export type AnyRecord = Record<string, any>

export type AnyRecordSchema = S.Schema<AnyRecord, AnyRecord>

type Erase<R, K> = R & K extends K & infer R1 ? R1 : R

/**
 * In later typescript versions constraining to StringRecord is a problem.
 * It may actually expose an earlier bug, because the compiler can't actually verify the values of filtered keys being StringRecord.
 * Should rethink this all when rebasing on latest effect/schema.
 */
export type StructFields = S.Schema<any, any> // S.Schema<unknown, any, any, StringRecord, any>

const RequestTag = Tag<never, never>()

export { Methods }

export const reqBrand = Symbol()

// Actually GET + DELETE
export interface QueryRequest<
  M,
  Path extends StructFields | undefined,
  Query extends StructFields | undefined,
  Headers extends StructFields | undefined,
  Fields extends StructFields,
  PPath extends `/${string}`
> extends S.Class<Simplify<FromStruct<Fields>>, Simplify<ToStruct<Fields>>, Simplify<ToStruct<Fields>>, M> { // , PropsExtensions<GetClassProps<Fields>>
  Body: undefined
  Path: Path
  Query: Query
  Headers: Headers
  path: PPath
  method: ReadMethods
  Tag: Tag<M, M>
  [reqBrand]: typeof reqBrand
}

// Actually all other methods except GET + DELETE
export interface BodyRequest<
  M,
  Path extends StructFields | undefined,
  Body extends StructFields | undefined,
  Query extends StructFields | undefined,
  Headers extends StructFields | undefined,
  Fields extends StructFields,
  PPath extends `/${string}`
> extends S.Class<Simplify<FromStruct<Fields>>, Simplify<ToStruct<Fields>>, Simplify<ToStruct<Fields>>, M> { // , PropsExtensions<GetClassProps<Self>>
  Path: Path
  Body: Body
  Query: Query
  Headers: Headers
  path: PPath
  method: WriteMethods
  Tag: Tag<M, M>
  [reqBrand]: typeof reqBrand
}

type ResponseString = "Response" | `${string}Response`
type RequestString = "Request" | "default" | `${string}Request`

type FilterRequest<U> = U extends RequestString ? U : never
export type GetRequestKey<U extends Record<RequestString | "Response", any>> = FilterRequest<keyof U>
export type GetRequest<U extends Record<RequestString | "Response", any>> = FilterRequest<keyof U> extends never ? never
  : U[FilterRequest<keyof U>]

type FilterResponse<U> = U extends ResponseString ? U : never
export type GetResponseKey<U extends Record<ResponseString, any>> = FilterResponse<
  keyof U
>
export type GetResponse<U extends Record<ResponseString, any>> = FilterResponse<
  keyof U
> extends never ? typeof S.void
  : U[FilterResponse<keyof U>]

export function extractRequest<TModule extends Record<string, any>>(
  h: TModule
): GetRequest<TModule> {
  const reqKey = Object.keys(h).find((x) => x.endsWith("Request"))
    || Object.keys(h).find((x) => x === "default")
  if (!reqKey) {
    throw new Error("Module appears to have no Request: " + Object.keys(h).join(", "))
  }
  const Request = h[reqKey]
  return Request
}

export function extractResponse<TModule extends Record<string, any>>(
  h: TModule
): GetResponse<TModule> | typeof S.void {
  const resKey = Object.keys(h).find((x) => x.endsWith("Response"))
  if (!resKey) {
    return S.void
  }
  const Response = h[resKey]
  return Response
}

// export const reqId = S.makeAnnotation()

type OrAny<T> = T extends S.Schema<any, any> ? T : S.Schema<any, any>
// type OrUndefined<T> = T extends S.Schema<any, any> ? undefined : S.Schema<any, any>

// TODO: Somehow ensure that Self and M are related..
// type Ensure<M, Self extends S.Schema<any, any>> = M extends S.To<Self> ? M : never
export function QueryRequest<M>(__name?: string) {
  function a<Headers extends StructFields, PPath extends `/${string}`>(
    method: ReadMethods,
    path: PPath,
    _: {
      headers?: Headers
    }
  ): QueryRequest<M, undefined, undefined, Headers, StructFields, PPath>
  function a<Path extends StructFields, Headers extends StructFields, PPath extends `/${string}`>(
    method: ReadMethods,
    path: PPath,
    _: {
      headers?: Headers
      path: Path
    }
  ): QueryRequest<M, Path, undefined, Headers, Path, PPath>
  function a<Query extends StructFields, Headers extends StructFields, PPath extends `/${string}`>(
    method: ReadMethods,
    path: PPath,
    {
      headers,
      query
    }: {
      headers?: Headers
      query: Query
    }
  ): QueryRequest<M, undefined, Query, Headers, Query, PPath>
  function a<
    QueryFields extends StructFields,
    PathFields extends StructFields,
    HeadersFields extends StructFields,
    PPath extends `/${string}`
  >(
    method: ReadMethods,
    path: PPath,
    _: {
      headers?: HeadersFields
      path: PathFields
      query: QueryFields
    }
  ): QueryRequest<
    M,
    PathFields,
    QueryFields,
    HeadersFields,
    QueryFields,
    PPath
  >
  function a<
    PathFields extends StructFields,
    QueryFields extends StructFields,
    HeadersFields extends StructFields,
    PPath extends `/${string}`
  >(
    method: ReadMethods,
    path: PPath,
    _: {
      headers?: HeadersFields
      path?: PathFields
      query?: QueryFields
    }
  ): QueryRequest<
    M,
    PathFields,
    QueryFields,
    HeadersFields,
    PathFields & QueryFields,
    PPath
  > {
    const self: S.Schema<any, any> = S.struct({
      ..._.query,
      ..._.path
    })
    // const schema = self >= S.annotate(reqId, {})
    const schema = self // TODO: reqId annotation
    // @ts-expect-error the following is correct
    return class extends ClassSpecial<M>(__name)(schema) {
      static Path = _.path
      static Query = _.query
      static Headers = _.headers
      static path = path
      static method = method
      static Tag = RequestTag
      static [reqBrand] = reqBrand
    }
  }
  return a
}

export function BodyRequest<M>(__name?: string) {
  function a<Headers extends StructFields, PPath extends `/${string}`>(
    method: WriteMethods,
    path: PPath,
    _: {
      headers?: Headers
    }
  ): BodyRequest<M, undefined, undefined, undefined, Headers, {}, PPath>
  function a<Path extends StructFields, Headers extends StructFields, PPath extends `/${string}`>(
    method: WriteMethods,
    path: PPath,
    _: {
      headers?: Headers
      path: Path
    }
  ): BodyRequest<M, Path, undefined, undefined, Headers, Path, PPath>
  function a<Body extends StructFields, Headers extends StructFields, PPath extends `/${string}`>(
    method: WriteMethods,
    path: PPath,
    _: {
      headers?: Headers
      body: Body
    }
  ): BodyRequest<M, undefined, Body, undefined, Headers, Body, PPath>
  function a<
    BodyFields extends StructFields,
    QueryFields extends StructFields,
    HeadersFields extends StructFields,
    PPath extends `/${string}`
  >(
    method: WriteMethods,
    path: PPath,
    _: {
      headers?: HeadersFields
      body: BodyFields
      query: QueryFields
    }
  ): BodyRequest<
    M,
    undefined,
    BodyFields,
    QueryFields,
    HeadersFields,
    BodyFields & QueryFields,
    PPath
  >
  function a<
    QueryFields extends StructFields,
    PathFields extends StructFields,
    HeadersFields extends StructFields,
    PPath extends `/${string}`
  >(
    method: WriteMethods,
    path: PPath,
    _: {
      headers?: HeadersFields
      path: PathFields
      query: QueryFields
    }
  ): BodyRequest<
    M,
    PathFields,
    QueryFields,
    undefined,
    HeadersFields,
    QueryFields,
    PPath
  >
  function a<
    BodyFields extends StructFields,
    PathFields extends StructFields,
    HeadersFields extends StructFields,
    PPath extends `/${string}`
  >(
    method: WriteMethods,
    path: PPath,
    _: {
      headers?: HeadersFields
      path: PathFields
      body: BodyFields
    }
  ): BodyRequest<
    M,
    PathFields,
    BodyFields,
    undefined,
    HeadersFields,
    BodyFields & PathFields,
    PPath
  >
  function a<
    BodyFields extends StructFields,
    PathFields extends StructFields,
    QueryFields extends StructFields,
    HeadersFields extends StructFields,
    PPath extends `/${string}`
  >(
    method: WriteMethods,
    path: PPath,
    _: {
      headers?: HeadersFields
      path: PathFields
      body: BodyFields
      query: QueryFields
    }
  ): BodyRequest<
    M,
    PathFields,
    BodyFields,
    QueryFields,
    HeadersFields,
    BodyFields & PathFields & QueryFields,
    PPath
  >
  function a<
    Path extends StructFields,
    Body extends StructFields,
    Query extends StructFields,
    Headers extends StructFields,
    PPath extends `/${string}`
  >(
    method: WriteMethods,
    path: PPath,
    _: {
      headers?: Headers
      path?: Path
      body?: Body
      query?: Query
    }
  ): BodyRequest<
    M,
    Path,
    Body,
    Query,
    Headers,
    OrAny<Erase<typeof _.path & typeof _.body & typeof _.query, S.Schema<any, any>>>,
    PPath
  > {
    const self: S.Schema<any, any> = S.struct({
      ..._.body,
      ..._.query,
      ..._.path
    })
    // const schema = self >= S.annotate(reqId, {})
    const schema = self // TODO: noRef
    // @ts-expect-error the following is correct
    return class extends ClassSpecial<M>(__name)(schema) {
      static Path = _.path
      static Body = _.body
      static Query = _.query
      static Headers = _.headers
      static path = path
      static method = method
      static Tag = RequestTag
      static [reqBrand] = reqBrand
    }
  }
  return a
}

export interface Request<
  M,
  Self extends S.Schema<any, any>,
  Path extends `/${string}`,
  Method extends Methods.Rest
> extends Class<M, Self> {
  method: Method
  path: Path
}

type Separator = "/" | "&" | "?.js"
export type PathParams<Path extends string> = Path extends `:${infer Param}${Separator}${infer Rest}`
  ? Param | PathParams<Rest>
  : Path extends `:${infer Param}` ? Param
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  : Path extends `${infer _Prefix}:${infer Rest}` ? PathParams<`:${Rest}`>
  : never

export type IfPathPropsProvided<Path extends string, B extends S.FieldRecord, C> =
  // Must test the PathParams inside here, as when they evaluate to never, the whole type would otherwise automatically resolve to never
  PathParams<Path> extends never ? C
    : PathParams<Path> extends keyof B ? C
    : ["You must specify the properties that you expect in the path", never]

/**
 * DELETE http method.
 * Input parameters other than Path, will be sent as QueryString.
 * Path parameters (specified with `:param_name`) must be present in the provided Schema.
 */
export function Delete<Path extends `/${string}`, Config extends object = {}>(path: Path, config?: Config) {
  return MethodReqProps2_("DELETE", path, config)
}
/**
 * PUT http method.
 * Input parameters other than Path, will be sent as Body.
 * Path parameters (specified with `:param_name`) must be present in the provided Schema.
 */
export function Put<Path extends `/${string}`, Config extends object = {}>(path: Path, config?: Config) {
  return MethodReqProps2_("PUT", path, config)
}

/**
 * GET http method.
 * Input parameters other than Path, will be sent as QueryString.
 * Path parameters (specified with `:param_name`) must be present in the provided Schema.
 */
export function Get<Path extends `/${string}`, Config extends object = {}>(path: Path, config?: Config) {
  return MethodReqProps2_("GET", path, config)
}
/**
 * PATCH http method.
 * Input parameters other than Path, will be sent as Body.
 * Path parameters (specified with `:param_name`) must be present in the provided Schema.
 */
export function Patch<Path extends `/${string}`, Config extends object = {}>(path: Path, config?: Config) {
  return MethodReqProps2_("PATCH", path, config)
}
/**
 * POST http method.
 * Input parameters other than Path, will be sent as Body.
 * Path parameters (specified with `:param_name`) must be present in the provided Schema.
 */
export function Post<Path extends `/${string}`, Config extends object = {}>(path: Path, config?: Config) {
  return MethodReqProps2_("POST", path, config)
}

function MethodReqProps2_<Method extends Methods.Rest, Path extends `/${string}`, Config extends object = {}>(
  method: Method,
  path: Path,
  config?: Config
) {
  return <M>(__name?: string) => {
    function a(): BuildRequest<
      never,
      Path,
      Method,
      M,
      Config
    >
    function a<ProvidedProps extends S.PropertyOrSchemaRecord>(
      fields: ProvidedProps
    ): BuildRequest<S.ToProps<ProvidedProps>, Path, Method, M, Config>
    function a<Fields extends S.PropertyOrSchemaRecord>(fields?: Fields) {
      const req = Req<M>(__name)
      const r = fields ? req(method, path, S.struct(fields), config) : req(method, path, config)
      return r
    }

    return a
  }
}

/**
 * Automatically picks path, query and body, based on Path params and Request Method.
 */
function Req<M>(__name?: string) {
  function a<
    Path extends `/${string}`,
    Method extends Methods.Rest,
    Config extends object = {}
  >(method: Method, path: Path, config?: Config): BuildRequest<never, Path, Method, M, Config>
  function a<
    Path extends `/${string}`,
    Method extends Methods.Rest,
    Fields extends S.FieldRecord,
    Config extends object = {}
  >(
    method: Method,
    path: Path,
    self: S.SchemaProperties<Fields>,
    config?: Config
  ): BuildRequest<Fields, Path, Method, M, Config>
  function a<
    Path extends `/${string}`,
    Method extends Methods.Rest,
    Fields extends S.FieldRecord,
    Config extends object = {}
  >(method: Method, path: Path, self?: S.SchemaProperties<Fields>, config?: Config) {
    return makeRequest<Fields, Path, Method, M, Config>(
      method,
      path,
      self ?? (S.struct({}) as any),
      undefined,
      config
    )
  }
  return a
}

export function parsePathParams<Path extends `/${string}`>(path: Path) {
  const p = new Path(path)
  const params = p.urlParams as PathParams<Path>[]
  return params
}

type BuildRequest<
  Fields extends S.FieldRecord,
  Path extends `/${string}`,
  Method extends Methods.Rest,
  M,
  Config extends object = {}
> = IfPathPropsProvided<
  Path,
  Fields,
  Method extends "GET" | "DELETE" ?
      & QueryRequest<
        M,
        S.SchemaProperties<Pick<Fields, PathParams<Path>>>,
        S.SchemaProperties<Omit<Fields, PathParams<Path>>>,
        undefined,
        S.SchemaProperties<Fields>,
        Path
      >
      & Config
    :
      & BodyRequest<
        M,
        S.SchemaProperties<Pick<Fields, PathParams<Path>>>,
        S.SchemaProperties<Omit<Fields, PathParams<Path>>>,
        undefined,
        undefined,
        S.SchemaProperties<Fields>,
        Path
      >
      & Config
>

// NOTE: This ignores the original schema after building the new
export function makeRequest<
  Fields extends S.FieldRecord,
  Path extends `/${string}`,
  Method extends Methods.Rest,
  M,
  Config extends object = {}
>(
  method: Method,
  path: Path,
  self: S.SchemaProperties<Fields>,
  __name?: string,
  config?: Config
): BuildRequest<Fields, Path, Method, M, Config> {
  const pathParams = parsePathParams(path)
  // TODO: path struct must be parsed "from string"
  const remainProps = { ...self.Api.fields }
  const pathProps = pathParams.length
    ? pathParams.reduce<Record<PathParams<Path>, any>>((prev, cur) => {
      prev[cur] = self.Api.fields[cur]
      delete remainProps[cur]
      return prev
    }, {} as Record<PathParams<Path>, any>)
    : null

  const dest = method === "GET" || method === "DELETE" ? "query" : "body"
  const newSchema = {
    path: pathProps ? S.struct(pathProps) : undefined,
    // TODO: query fields must be parsed "from string"

    [dest]: S.struct(remainProps)
  }
  if (method === "GET" || method === "DELETE") {
    return class extends Object.assign(
      QueryRequest<M>(__name)(
        method as ReadMethods,
        path,
        newSchema as any
      ),
      config ?? {}
    ) {} as any
  }
  return class extends Object.assign(
    BodyRequest<M>(__name)(
      method as WriteMethods,
      path,
      newSchema as any
    ),
    config ?? {}
  ) {} as any
}

export function adaptRequest<
  Fields extends S.FieldRecord,
  Path extends `/${string}`,
  Method extends Methods.Rest,
  M,
  Config extends object = {}
>(req: Request<M, S.SchemaProperties<Fields>, Path, Method>, config?: Config) {
  return makeRequest<Fields, Path, Method, M, Config>(req.method, req.path, req[S.schemaField], undefined, config)
}

export type Meta = { description?: string; summary?: string; openapiRef?: string }
export const metaIdentifier = S.makeAnnotation<Meta>()
export function meta<ParserInput, To, ConstructorInput, From, Api>(
  meta: Meta
) {
  return (self: S.Schema<ParserInput, To, ConstructorInput, From, Api>) => self.annotate(metaIdentifier, meta)
}
export const metaC = (m: Meta) => {
  return function(cls: any) {
    setSchema(cls, pipe(cls[schemaField], meta(m)) as any)
    return cls
  }
}

export type ReqRes<E, A> = S.Schema<
  unknown, // ParserInput,
  A, // To,
  any, // ConstructorInput,
  E, // From,
  any // Api
>
export type ReqResSchemed<E, A> = {
  new(...args: any[]): any
  encodeSync: S.Encoder.Encoder<A, E>
  Model: ReqRes<E, A>
}

export type RequestSchemed<E, A> = ReqResSchemed<E, A> & {
  method: Methods.Rest
  path: string
}

export function extractSchema<ResE, ResA>(
  Res_: ReqRes<ResE, ResA> | ReqResSchemed<ResE, ResA>
) {
  const res_ = Res_
  const Res = res_[schemaField]
    ? (res_.Model as ReqRes<ResE, ResA>)
    : (res_ as ReqRes<ResE, ResA>)
  return Res
}
