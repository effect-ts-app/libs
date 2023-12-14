/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Path } from "path-parser"

import { Void } from "./_api.js"
import * as S from "./_schema.js"
import { schemaField } from "./_schema.js"
import type { AnyRecord, AnyRecordSchema, Class, GetClassProps, PropsExtensions, StringRecord } from "./Class.js"
import { ClassSpecial, setSchema } from "./Class.js"
import type { ReadMethods, WriteMethods } from "./Methods.js"

import * as Methods from "./Methods.js"

type Erase<R, K> = R & K extends K & infer R1 ? R1 : R

/**
 * In later typescript versions constraining to StringRecord is a problem.
 * It may actually expose an earlier bug, because the compiler can't actually verify the values of filtered keys being StringRecord.
 * Should rethink this all when rebasing on latest effect/schema.
 */
export type StringRecordSchema = S.SchemaAny // S.Schema<unknown, any, any, StringRecord, any>

const RequestTag = Tag<never, never>()

export { Methods }

export const reqBrand = Symbol()

// Actually GET + DELETE
export interface QueryRequest<
  M,
  Path extends StringRecordSchema | undefined,
  Query extends StringRecordSchema | undefined,
  Headers extends StringRecordSchema | undefined,
  Self extends S.SchemaAny,
  PPath extends `/${string}`
> extends Class<M, Self>, PropsExtensions<GetClassProps<Self>> {
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
  Path extends StringRecordSchema | undefined,
  Body extends AnyRecordSchema | undefined,
  Query extends StringRecordSchema | undefined,
  Headers extends StringRecordSchema | undefined,
  Self extends AnyRecordSchema,
  PPath extends `/${string}`
> extends Class<M, Self>, PropsExtensions<GetClassProps<Self>> {
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
> extends never ? typeof Void
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
): GetResponse<TModule> | typeof Void {
  const resKey = Object.keys(h).find((x) => x.endsWith("Response"))
  if (!resKey) {
    return Void
  }
  const Response = h[resKey]
  return Response
}

export const reqId = S.makeAnnotation()

type OrAny<T> = T extends S.SchemaAny ? T : S.SchemaAny
// type OrUndefined<T> = T extends S.SchemaAny ? undefined : S.SchemaAny

// TODO: Somehow ensure that Self and M are related..
// type Ensure<M, Self extends S.SchemaAny> = M extends S.To<Self> ? M : never
export function QueryRequest<M>(__name?: string) {
  function a<Headers extends StringRecordSchema, PPath extends `/${string}`>(
    method: ReadMethods,
    path: PPath,
    _: {
      headers?: Headers
    }
  ): QueryRequest<M, undefined, undefined, Headers, S.SchemaAny, PPath>
  function a<Path extends StringRecordSchema, Headers extends StringRecordSchema, PPath extends `/${string}`>(
    method: ReadMethods,
    path: PPath,
    _: {
      headers?: Headers
      path: Path
    }
  ): QueryRequest<M, Path, undefined, Headers, Path, PPath>
  function a<Query extends StringRecordSchema, Headers extends StringRecordSchema, PPath extends `/${string}`>(
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
    QueryTo extends AnyRecord,
    QueryConstructorInput,
    QueryFrom extends StringRecord,
    QueryApi,
    PathTo extends AnyRecord,
    PathConstructorInput,
    PathFrom extends StringRecord,
    PathApi,
    Headers extends StringRecordSchema,
    PPath extends `/${string}`
  >(
    method: ReadMethods,
    path: PPath,
    _: {
      headers?: Headers
      path: S.Schema<
        unknown,
        PathTo,
        PathConstructorInput,
        PathFrom,
        PathApi
      >
      query: S.Schema<
        unknown,
        QueryTo,
        QueryConstructorInput,
        QueryFrom,
        QueryApi
      >
    }
  ): QueryRequest<
    M,
    S.Schema<unknown, PathTo, PathConstructorInput, PathFrom, PathApi>,
    S.Schema<unknown, QueryTo, QueryConstructorInput, QueryFrom, QueryApi>,
    Headers,
    S.Schema<
      unknown,
      QueryTo & PathTo,
      QueryConstructorInput & PathConstructorInput,
      QueryFrom & PathFrom,
      {}
    >,
    PPath
  >
  function a<
    Path extends StringRecordSchema,
    Query extends StringRecordSchema,
    Headers extends StringRecordSchema,
    PPath extends `/${string}`
  >(
    method: ReadMethods,
    path: PPath,
    _: {
      headers?: Headers
      path?: Path
      query?: Query
    }
  ): QueryRequest<
    M,
    Path,
    Query,
    Headers,
    OrAny<Erase<typeof _.path & typeof _.query, S.SchemaAny>>,
    PPath
  > {
    const self: S.SchemaAny = S.struct({
      ..._.query?.Api.fields,
      ..._.path?.Api.fields
    })
    const schema = self >= S.annotate(reqId, {})
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
  function a<Headers extends StringRecordSchema, PPath extends `/${string}`>(
    method: WriteMethods,
    path: PPath,
    _: {
      headers?: Headers
    }
  ): BodyRequest<M, undefined, undefined, undefined, Headers, S.SchemaAny, PPath>
  function a<Path extends StringRecordSchema, Headers extends StringRecordSchema, PPath extends `/${string}`>(
    method: WriteMethods,
    path: PPath,
    _: {
      headers?: Headers
      path: Path
    }
  ): BodyRequest<M, Path, undefined, undefined, Headers, Path, PPath>
  function a<Body extends AnyRecordSchema, Headers extends StringRecordSchema, PPath extends `/${string}`>(
    method: WriteMethods,
    path: PPath,
    _: {
      headers?: Headers
      body: Body
    }
  ): BodyRequest<M, undefined, Body, undefined, Headers, Body, PPath>
  function a<
    BodyTo extends AnyRecord,
    BodyConstructorInput,
    BodyFrom extends AnyRecord,
    BodyApi,
    QueryTo extends AnyRecord,
    QueryConstructorInput,
    QueryFrom extends StringRecord,
    QueryApi,
    Headers extends StringRecordSchema,
    PPath extends `/${string}`
  >(
    method: WriteMethods,
    path: PPath,
    _: {
      headers?: Headers
      body: S.Schema<
        unknown,
        BodyTo,
        BodyConstructorInput,
        BodyFrom,
        BodyApi
      >
      query: S.Schema<
        unknown,
        QueryTo,
        QueryConstructorInput,
        QueryFrom,
        QueryApi
      >
    }
  ): BodyRequest<
    M,
    undefined,
    S.Schema<unknown, BodyTo, BodyConstructorInput, BodyFrom, BodyApi>,
    S.Schema<unknown, QueryTo, QueryConstructorInput, QueryFrom, QueryApi>,
    Headers,
    S.Schema<
      unknown,
      BodyTo & QueryTo,
      BodyConstructorInput & QueryConstructorInput,
      BodyFrom & QueryFrom,
      {}
    >,
    PPath
  >
  function a<
    QueryTo extends AnyRecord,
    QueryConstructorInput,
    QueryFrom extends StringRecord,
    QueryApi,
    PathTo extends AnyRecord,
    PathConstructorInput,
    PathFrom extends StringRecord,
    PathApi,
    Headers extends StringRecordSchema,
    PPath extends `/${string}`
  >(
    method: WriteMethods,
    path: PPath,
    _: {
      headers?: Headers
      path: S.Schema<
        unknown,
        PathTo,
        PathConstructorInput,
        PathFrom,
        PathApi
      >
      query: S.Schema<
        unknown,
        QueryTo,
        QueryConstructorInput,
        QueryFrom,
        QueryApi
      >
    }
  ): BodyRequest<
    M,
    S.Schema<unknown, PathTo, PathConstructorInput, PathFrom, PathApi>,
    S.Schema<unknown, QueryTo, QueryConstructorInput, QueryFrom, QueryApi>,
    undefined,
    Headers,
    S.Schema<
      unknown,
      QueryTo & PathTo,
      QueryConstructorInput & PathConstructorInput,
      QueryFrom & PathFrom,
      {}
    >,
    PPath
  >
  function a<
    BodyTo extends AnyRecord,
    BodyConstructorInput,
    BodyFrom extends AnyRecord,
    BodyApi,
    PathTo extends AnyRecord,
    PathConstructorInput,
    PathFrom extends StringRecord,
    PathApi,
    Headers extends StringRecordSchema,
    PPath extends `/${string}`
  >(
    method: WriteMethods,
    path: PPath,
    _: {
      headers?: Headers
      path: S.Schema<
        unknown,
        PathTo,
        PathConstructorInput,
        PathFrom,
        PathApi
      >
      body: S.Schema<
        unknown,
        BodyTo,
        BodyConstructorInput,
        BodyFrom,
        BodyApi
      >
    }
  ): BodyRequest<
    M,
    S.Schema<unknown, PathTo, PathConstructorInput, PathFrom, PathApi>,
    S.Schema<unknown, BodyTo, BodyConstructorInput, BodyFrom, BodyApi>,
    undefined,
    Headers,
    S.Schema<
      unknown,
      BodyTo & PathTo,
      BodyConstructorInput & PathConstructorInput,
      BodyFrom & PathFrom,
      {}
    >,
    PPath
  >
  function a<
    BodyTo extends AnyRecord,
    BodyConstructorInput,
    BodyFrom extends AnyRecord,
    BodyApi,
    PathTo extends AnyRecord,
    PathConstructorInput,
    PathFrom extends StringRecord,
    PathApi,
    QueryTo extends AnyRecord,
    QueryConstructorInput,
    QueryFrom extends StringRecord,
    QueryApi,
    Headers extends StringRecordSchema,
    PPath extends `/${string}`
  >(
    method: WriteMethods,
    path: PPath,
    _: {
      headers?: Headers
      path: S.Schema<
        unknown,
        PathTo,
        PathConstructorInput,
        PathFrom,
        PathApi
      >
      body: S.Schema<
        unknown,
        BodyTo,
        BodyConstructorInput,
        BodyFrom,
        BodyApi
      >
      query: S.Schema<
        unknown,
        QueryTo,
        QueryConstructorInput,
        QueryFrom,
        QueryApi
      >
    }
  ): BodyRequest<
    M,
    S.Schema<unknown, PathTo, PathConstructorInput, PathFrom, PathApi>,
    S.Schema<unknown, BodyTo, BodyConstructorInput, BodyFrom, BodyApi>,
    S.Schema<unknown, QueryTo, QueryConstructorInput, QueryFrom, QueryApi>,
    Headers,
    S.Schema<
      unknown,
      BodyTo & PathTo & QueryTo,
      BodyConstructorInput & PathConstructorInput & QueryConstructorInput,
      BodyFrom & PathFrom & QueryFrom,
      {}
    >,
    PPath
  >
  function a<
    Path extends StringRecordSchema,
    Body extends AnyRecordSchema,
    Query extends StringRecordSchema,
    Headers extends StringRecordSchema,
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
    OrAny<Erase<typeof _.path & typeof _.body & typeof _.query, S.SchemaAny>>,
    PPath
  > {
    const self: S.SchemaAny = S.struct({
      ..._.body?.Api.fields,
      ..._.query?.Api.fields,
      ..._.path?.Api.fields
    })
    const schema = self >= S.annotate(reqId, {})
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
  Self extends S.SchemaAny,
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
  const res_ = Res_ as any
  const Res = res_[schemaField]
    ? (res_.Model as ReqRes<ResE, ResA>)
    : (res_ as ReqRes<ResE, ResA>)
  return Res
}
