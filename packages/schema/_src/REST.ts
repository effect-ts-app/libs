/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Erase } from "@effect-app/core/Effect"
import { Path } from "path-parser"

import { Void } from "./_api.js"
import * as MO from "./_schema.js"
import { schemaField } from "./_schema.js"
import type { ReadMethods, WriteMethods } from "./Methods.js"
import type { AnyRecord, AnyRecordSchema, GetModelProps, Model, PropsExtensions, StringRecord } from "./Model.js"
import { ModelSpecial, setSchema } from "./Model.js"

import * as Methods from "./Methods.js"

export type StringRecordSchema = MO.Schema<unknown, any, any, StringRecord, any>

const RequestTag = Tag<never, never>()

export { Methods }

export const reqBrand = Symbol()

// Actually GET + DELETE
export interface QueryRequest<
  M,
  Path extends StringRecordSchema | undefined,
  Query extends StringRecordSchema | undefined,
  Headers extends StringRecordSchema | undefined,
  Self extends MO.SchemaAny
> extends Model<M, Self>, PropsExtensions<GetModelProps<Self>> {
  Body: undefined
  Path: Path
  Query: Query
  Headers: Headers
  path: string
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
  Self extends AnyRecordSchema
> extends Model<M, Self>, PropsExtensions<GetModelProps<Self>> {
  Path: Path
  Body: Body
  Query: Query
  Headers: Headers
  path: string
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

export const reqId = MO.makeAnnotation()

type OrAny<T> = T extends MO.SchemaAny ? T : MO.SchemaAny
// type OrUndefined<T> = T extends MO.SchemaAny ? undefined : MO.SchemaAny

// TODO: Somehow ensure that Self and M are related..
// type Ensure<M, Self extends MO.SchemaAny> = M extends MO.To<Self> ? M : never
export function QueryRequest<M>(__name?: string) {
  function a<Headers extends StringRecordSchema>(
    method: ReadMethods,
    path: string,
    _: {
      headers?: Headers
    }
  ): QueryRequest<M, undefined, undefined, Headers, MO.SchemaAny>
  function a<Path extends StringRecordSchema, Headers extends StringRecordSchema>(
    method: ReadMethods,
    path: string,
    _: {
      headers?: Headers
      path: Path
    }
  ): QueryRequest<M, Path, undefined, Headers, Path>
  function a<Query extends StringRecordSchema, Headers extends StringRecordSchema>(
    method: ReadMethods,
    path: string,
    {
      headers,
      query
    }: {
      headers?: Headers
      query: Query
    }
  ): QueryRequest<M, undefined, Query, Headers, Query>
  function a<
    QueryParsedShape extends AnyRecord,
    QueryConstructorInput,
    QueryEncoded extends StringRecord,
    QueryApi,
    PathParsedShape extends AnyRecord,
    PathConstructorInput,
    PathEncoded extends StringRecord,
    PathApi,
    Headers extends StringRecordSchema
  >(
    method: ReadMethods,
    path: string,
    _: {
      headers?: Headers
      path: MO.Schema<
        unknown,
        PathParsedShape,
        PathConstructorInput,
        PathEncoded,
        PathApi
      >
      query: MO.Schema<
        unknown,
        QueryParsedShape,
        QueryConstructorInput,
        QueryEncoded,
        QueryApi
      >
    }
  ): QueryRequest<
    M,
    MO.Schema<unknown, PathParsedShape, PathConstructorInput, PathEncoded, PathApi>,
    MO.Schema<unknown, QueryParsedShape, QueryConstructorInput, QueryEncoded, QueryApi>,
    Headers,
    MO.Schema<
      unknown,
      QueryParsedShape & PathParsedShape,
      QueryConstructorInput & PathConstructorInput,
      QueryEncoded & PathEncoded,
      {}
    >
  >
  function a<
    Path extends StringRecordSchema,
    Query extends StringRecordSchema,
    Headers extends StringRecordSchema
  >(
    method: ReadMethods,
    path: string,
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
    OrAny<Erase<typeof _.path & typeof _.query, MO.SchemaAny>>
  > {
    const self: MO.SchemaAny = MO.struct({
      ..._.query?.Api.fields,
      ..._.path?.Api.fields
    })
    const schema = self >= MO.annotate(reqId, {})
    // @ts-expect-error the following is correct
    return class extends ModelSpecial<M>(__name)(schema) {
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
  function a<Headers extends StringRecordSchema>(
    method: WriteMethods,
    path: string,
    _: {
      headers?: Headers
    }
  ): BodyRequest<M, undefined, undefined, undefined, Headers, MO.SchemaAny>
  function a<Path extends StringRecordSchema, Headers extends StringRecordSchema>(
    method: WriteMethods,
    path: string,
    _: {
      headers?: Headers
      path: Path
    }
  ): BodyRequest<M, Path, undefined, undefined, Headers, Path>
  function a<Body extends AnyRecordSchema, Headers extends StringRecordSchema>(
    method: WriteMethods,
    path: string,
    _: {
      headers?: Headers
      body: Body
    }
  ): BodyRequest<M, undefined, Body, undefined, Headers, Body>
  function a<
    BodyParsedShape extends AnyRecord,
    BodyConstructorInput,
    BodyEncoded extends AnyRecord,
    BodyApi,
    QueryParsedShape extends AnyRecord,
    QueryConstructorInput,
    QueryEncoded extends StringRecord,
    QueryApi,
    Headers extends StringRecordSchema
  >(
    method: WriteMethods,
    path: string,
    _: {
      headers?: Headers
      body: MO.Schema<
        unknown,
        BodyParsedShape,
        BodyConstructorInput,
        BodyEncoded,
        BodyApi
      >
      query: MO.Schema<
        unknown,
        QueryParsedShape,
        QueryConstructorInput,
        QueryEncoded,
        QueryApi
      >
    }
  ): BodyRequest<
    M,
    undefined,
    MO.Schema<unknown, BodyParsedShape, BodyConstructorInput, BodyEncoded, BodyApi>,
    MO.Schema<unknown, QueryParsedShape, QueryConstructorInput, QueryEncoded, QueryApi>,
    Headers,
    MO.Schema<
      unknown,
      BodyParsedShape & QueryParsedShape,
      BodyConstructorInput & QueryConstructorInput,
      BodyEncoded & QueryEncoded,
      {}
    >
  >
  function a<
    QueryParsedShape extends AnyRecord,
    QueryConstructorInput,
    QueryEncoded extends StringRecord,
    QueryApi,
    PathParsedShape extends AnyRecord,
    PathConstructorInput,
    PathEncoded extends StringRecord,
    PathApi,
    Headers extends StringRecordSchema
  >(
    method: WriteMethods,
    path: string,
    _: {
      headers?: Headers
      path: MO.Schema<
        unknown,
        PathParsedShape,
        PathConstructorInput,
        PathEncoded,
        PathApi
      >
      query: MO.Schema<
        unknown,
        QueryParsedShape,
        QueryConstructorInput,
        QueryEncoded,
        QueryApi
      >
    }
  ): BodyRequest<
    M,
    MO.Schema<unknown, PathParsedShape, PathConstructorInput, PathEncoded, PathApi>,
    MO.Schema<unknown, QueryParsedShape, QueryConstructorInput, QueryEncoded, QueryApi>,
    undefined,
    Headers,
    MO.Schema<
      unknown,
      QueryParsedShape & PathParsedShape,
      QueryConstructorInput & PathConstructorInput,
      QueryEncoded & PathEncoded,
      {}
    >
  >
  function a<
    BodyParsedShape extends AnyRecord,
    BodyConstructorInput,
    BodyEncoded extends AnyRecord,
    BodyApi,
    PathParsedShape extends AnyRecord,
    PathConstructorInput,
    PathEncoded extends StringRecord,
    PathApi,
    Headers extends StringRecordSchema
  >(
    method: WriteMethods,
    path: string,
    _: {
      headers?: Headers
      path: MO.Schema<
        unknown,
        PathParsedShape,
        PathConstructorInput,
        PathEncoded,
        PathApi
      >
      body: MO.Schema<
        unknown,
        BodyParsedShape,
        BodyConstructorInput,
        BodyEncoded,
        BodyApi
      >
    }
  ): BodyRequest<
    M,
    MO.Schema<unknown, PathParsedShape, PathConstructorInput, PathEncoded, PathApi>,
    MO.Schema<unknown, BodyParsedShape, BodyConstructorInput, BodyEncoded, BodyApi>,
    undefined,
    Headers,
    MO.Schema<
      unknown,
      BodyParsedShape & PathParsedShape,
      BodyConstructorInput & PathConstructorInput,
      BodyEncoded & PathEncoded,
      {}
    >
  >
  function a<
    BodyParsedShape extends AnyRecord,
    BodyConstructorInput,
    BodyEncoded extends AnyRecord,
    BodyApi,
    PathParsedShape extends AnyRecord,
    PathConstructorInput,
    PathEncoded extends StringRecord,
    PathApi,
    QueryParsedShape extends AnyRecord,
    QueryConstructorInput,
    QueryEncoded extends StringRecord,
    QueryApi,
    Headers extends StringRecordSchema
  >(
    method: WriteMethods,
    path: string,
    _: {
      headers?: Headers
      path: MO.Schema<
        unknown,
        PathParsedShape,
        PathConstructorInput,
        PathEncoded,
        PathApi
      >
      body: MO.Schema<
        unknown,
        BodyParsedShape,
        BodyConstructorInput,
        BodyEncoded,
        BodyApi
      >
      query: MO.Schema<
        unknown,
        QueryParsedShape,
        QueryConstructorInput,
        QueryEncoded,
        QueryApi
      >
    }
  ): BodyRequest<
    M,
    MO.Schema<unknown, PathParsedShape, PathConstructorInput, PathEncoded, PathApi>,
    MO.Schema<unknown, BodyParsedShape, BodyConstructorInput, BodyEncoded, BodyApi>,
    MO.Schema<unknown, QueryParsedShape, QueryConstructorInput, QueryEncoded, QueryApi>,
    Headers,
    MO.Schema<
      unknown,
      BodyParsedShape & PathParsedShape & QueryParsedShape,
      BodyConstructorInput & PathConstructorInput & QueryConstructorInput,
      BodyEncoded & PathEncoded & QueryEncoded,
      {}
    >
  >
  function a<
    Path extends StringRecordSchema,
    Body extends AnyRecordSchema,
    Query extends StringRecordSchema,
    Headers extends StringRecordSchema
  >(
    method: WriteMethods,
    path: string,
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
    OrAny<Erase<typeof _.path & typeof _.body & typeof _.query, MO.SchemaAny>>
  > {
    const self: MO.SchemaAny = MO.struct({
      ..._.body?.Api.fields,
      ..._.query?.Api.fields,
      ..._.path?.Api.fields
    })
    const schema = self >= MO.annotate(reqId, {})
    // @ts-expect-error the following is correct
    return class extends ModelSpecial<M>(__name)(schema) {
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
  Self extends MO.SchemaAny,
  Path extends string,
  Method extends Methods.Rest
> extends Model<M, Self> {
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

export type IfPathPropsProvided<Path extends string, B extends MO.PropertyRecord, C> =
  // Must test the PathParams inside here, as when they evaluate to never, the whole type would otherwise automatically resolve to never
  PathParams<Path> extends never ? C
    : PathParams<Path> extends keyof B ? C
    : ["You must specify the properties that you expect in the path", never]

/**
 * DELETE http method.
 * Input parameters other than Path, will be sent as QueryString.
 * Path parameters (specified with `:param_name`) must be present in the provided Schema.
 */
export function Delete<Path extends string, Config extends object = {}>(path: Path, config?: Config) {
  return MethodReqProps2_("DELETE", path, config)
}
/**
 * PUT http method.
 * Input parameters other than Path, will be sent as Body.
 * Path parameters (specified with `:param_name`) must be present in the provided Schema.
 */
export function Put<Path extends string, Config extends object = {}>(path: Path, config?: Config) {
  return MethodReqProps2_("PUT", path, config)
}

/**
 * GET http method.
 * Input parameters other than Path, will be sent as QueryString.
 * Path parameters (specified with `:param_name`) must be present in the provided Schema.
 */
export function Get<Path extends string, Config extends object = {}>(path: Path, config?: Config) {
  return MethodReqProps2_("GET", path, config)
}
/**
 * PATCH http method.
 * Input parameters other than Path, will be sent as Body.
 * Path parameters (specified with `:param_name`) must be present in the provided Schema.
 */
export function Patch<Path extends string, Config extends object = {}>(path: Path, config?: Config) {
  return MethodReqProps2_("PATCH", path, config)
}
/**
 * POST http method.
 * Input parameters other than Path, will be sent as Body.
 * Path parameters (specified with `:param_name`) must be present in the provided Schema.
 */
export function Post<Path extends string, Config extends object = {}>(path: Path, config?: Config) {
  return MethodReqProps2_("POST", path, config)
}

function MethodReqProps2_<Method extends Methods.Rest, Path extends string, Config extends object = {}>(
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
    function a<ProvidedProps extends MO.PropertyOrSchemaRecord>(
      fields: ProvidedProps
    ): BuildRequest<MO.ToProps<ProvidedProps>, Path, Method, M, Config>
    function a<Fields extends MO.PropertyOrSchemaRecord>(fields?: Fields) {
      const req = Req<M>(__name)
      const r = fields ? req(method, path, MO.struct(fields), config) : req(method, path, config)
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
    Path extends string,
    Method extends Methods.Rest,
    Config extends object = {}
  >(method: Method, path: Path, config?: Config): BuildRequest<never, Path, Method, M, Config>
  function a<
    Path extends string,
    Method extends Methods.Rest,
    Fields extends MO.PropertyRecord,
    Config extends object = {}
  >(
    method: Method,
    path: Path,
    self: MO.SchemaProperties<Fields>,
    config?: Config
  ): BuildRequest<Fields, Path, Method, M, Config>
  function a<
    Path extends string,
    Method extends Methods.Rest,
    Fields extends MO.PropertyRecord,
    Config extends object = {}
  >(method: Method, path: Path, self?: MO.SchemaProperties<Fields>, config?: Config) {
    return makeRequest<Fields, Path, Method, M, Config>(
      method,
      path,
      self ?? (MO.struct({}) as any),
      undefined,
      config
    )
  }
  return a
}

export function parsePathParams<Path extends string>(path: Path) {
  const p = new Path(path)
  const params = p.urlParams as PathParams<Path>[]
  return params
}

type BuildRequest<
  Fields extends MO.PropertyRecord,
  Path extends string,
  Method extends Methods.Rest,
  M,
  Config extends object = {}
> = IfPathPropsProvided<
  Path,
  Fields,
  Method extends "GET" | "DELETE" ?
      & QueryRequest<
        M,
        MO.SchemaProperties<Pick<Fields, PathParams<Path>>>,
        MO.SchemaProperties<Omit<Fields, PathParams<Path>>>,
        undefined,
        MO.SchemaProperties<Fields>
      >
      & Config
    :
      & BodyRequest<
        M,
        MO.SchemaProperties<Pick<Fields, PathParams<Path>>>,
        MO.SchemaProperties<Omit<Fields, PathParams<Path>>>,
        undefined,
        undefined,
        MO.SchemaProperties<Fields>
      >
      & Config
>

// NOTE: This ignores the original schema after building the new
export function makeRequest<
  Fields extends MO.PropertyRecord,
  Path extends string,
  Method extends Methods.Rest,
  M,
  Config extends object = {}
>(
  method: Method,
  path: Path,
  self: MO.SchemaProperties<Fields>,
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
    path: pathProps ? MO.struct(pathProps) : undefined,
    // TODO: query fields must be parsed "from string"

    [dest]: MO.struct(remainProps)
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
  Fields extends MO.PropertyRecord,
  Path extends string,
  Method extends Methods.Rest,
  M,
  Config extends object = {}
>(req: Request<M, MO.SchemaProperties<Fields>, Path, Method>, config?: Config) {
  return makeRequest<Fields, Path, Method, M, Config>(req.method, req.path, req[MO.schemaField], undefined, config)
}

export type Meta = { description?: string; summary?: string; openapiRef?: string }
export const metaIdentifier = MO.makeAnnotation<Meta>()
export function meta<ParserInput, To, ConstructorInput, From, Api>(
  meta: Meta
) {
  return (self: MO.Schema<ParserInput, To, ConstructorInput, From, Api>) =>
    self.annotate(metaIdentifier, meta)
}
export const metaC = (m: Meta) => {
  return function(cls: any) {
    setSchema(cls, pipe(cls[schemaField], meta(m)) as any)
    return cls
  }
}

export type ReqRes<E, A> = MO.Schema<
  unknown, // ParserInput,
  A, // To,
  any, // ConstructorInput,
  E, // From,
  any // Api
>
export type ReqResSchemed<E, A> = {
  new(...args: any[]): any
  Encoder: MO.Encoder.Encoder<A, E>
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
