/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Erase } from "@effect-ts-app/core/Effect"
import { Path } from "path-parser"

import { Void } from "./_api/index.js"
import * as MO from "./_schema.js"
import { schemaField } from "./_schema.js"
import {
  AnyRecord,
  AnyRecordSchema,
  GetProps,
  Model,
  ModelSpecial,
  PropsExtensions,
  setSchema,
  StringRecord,
} from "./Model.js"

export type StringRecordSchema = MO.Schema<unknown, any, any, StringRecord, any>

export const GET = "GET"
export type GET = typeof GET

export const POST = "POST"
export type POST = typeof POST

export const PUT = "PUT"
export type PUT = typeof PUT

export const PATCH = "PATCH"
export type PATCH = typeof PATCH

export const DELETE = "DELETE"
export type DELETE = typeof DELETE

export const UPDATE = "UPDATE"
export type UPDATE = typeof UPDATE

export const OPTIONS = "OPTIONS"
export type OPTIONS = typeof OPTIONS

export const HEAD = "HEAD"
export type HEAD = typeof HEAD

export const TRACE = "TRACE"
export type TRACE = typeof TRACE

export type ReadMethods = GET
export type WriteMethods = POST | PUT | PATCH | DELETE

export type Methods = ReadMethods | WriteMethods

export const reqBrand = Symbol()

// Actually GET + DELETE
export interface QueryRequest<
  M,
  Path extends StringRecordSchema | undefined,
  Query extends StringRecordSchema | undefined,
  Headers extends StringRecordSchema | undefined,
  Self extends MO.SchemaAny
> extends Model<M, Self>,
    PropsExtensions<GetProps<Self>> {
  Body: undefined
  Path: Path
  Query: Query
  Headers: Headers
  path: string
  method: ReadMethods
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
> extends Model<M, Self>,
    PropsExtensions<GetProps<Self>> {
  Path: Path
  Body: Body
  Query: Query
  Headers: Headers
  path: string
  method: WriteMethods
  [reqBrand]: typeof reqBrand
}

type ResponseString = "Response" | `${string}Response`
type RequestString = "Request" | "default" | `${string}Request`

type FilterRequest<U> = U extends RequestString ? U : never
export type GetRequestKey<U extends Record<RequestString | "Response", any>> =
  FilterRequest<keyof U>
export type GetRequest<U extends Record<RequestString | "Response", any>> =
  FilterRequest<keyof U> extends never ? never : U[FilterRequest<keyof U>]

type FilterResponse<U> = U extends ResponseString ? U : never
export type GetResponseKey<U extends Record<ResponseString, any>> = FilterResponse<
  keyof U
>
export type GetResponse<U extends Record<ResponseString, any>> = FilterResponse<
  keyof U
> extends never
  ? typeof Void
  : U[FilterResponse<keyof U>]

export function extractRequest<TModule extends Record<string, any>>(
  h: TModule
): GetRequest<TModule> {
  const reqKey =
    Object.keys(h).find((x) => x.endsWith("Request")) ||
    Object.keys(h).find((x) => x === "default")
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
//type OrUndefined<T> = T extends MO.SchemaAny ? undefined : MO.SchemaAny

// TODO: Somehow ensure that Self and M are related..
//type Ensure<M, Self extends MO.SchemaAny> = M extends MO.ParsedShapeOf<Self> ? M : never
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
      query,
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
    const self: MO.SchemaAny = MO.props({
      ..._.query?.Api.props,
      ..._.path?.Api.props,
    })
    const schema = self >= MO.annotate(reqId, {})
    // @ts-expect-error the following is correct
    return class extends ModelSpecial<M>(__name)(schema) {
      static Path = _.path
      static Query = _.query
      static Headers = _.headers
      static path = path
      static method = method
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
    const self: MO.SchemaAny = MO.props({
      ..._.body?.Api.props,
      ..._.query?.Api.props,
      ..._.path?.Api.props,
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
      static [reqBrand] = reqBrand
    }
  }
  return a
}

export interface Request<
  M,
  Self extends MO.SchemaAny,
  Path extends string,
  Method extends Methods
> extends Model<M, Self> {
  method: Method
  path: Path
}

type Separator = "/" | "&" | "?.js"
export type PathParams<Path extends string> =
  Path extends `:${infer Param}${Separator}${infer Rest}`
    ? Param | PathParams<Rest>
    : Path extends `:${infer Param}`
    ? Param
    : // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Path extends `${infer _Prefix}:${infer Rest}`
    ? PathParams<`:${Rest}`>
    : never

export type IfPathPropsProvided<Path extends string, B extends MO.PropertyRecord, C> =
  // Must test the PathParams inside here, as when they evaluate to never, the whole type would otherwise automatically resolve to never
  PathParams<Path> extends never
    ? C
    : PathParams<Path> extends keyof B
    ? C
    : ["You must specify the properties that you expect in the path", never]

/**
 * See {@link Req} but with Props
 */
export function ReqProps<M>() {
  function a<
    Path extends string,
    Method extends Methods,
    Props extends MO.PropertyRecord = {}
  >(method: Method, path: Path): BuildRequest<Props, Path, Method, M>
  function a<
    Path extends string,
    Method extends Methods,
    Props extends MO.PropertyRecord
  >(method: Method, path: Path, props: Props): BuildRequest<Props, Path, Method, M>
  function a<
    Path extends string,
    Method extends Methods,
    Props extends MO.PropertyRecord
  >(method: Method, path: Path, props?: Props) {
    const req = Req<M>()
    const r = props ? req(method, path, MO.props(props)) : req(method, path)
    return r
  }

  return a
}

/**
 * DELETE http method.
 * Input parameters other than Path, will be sent as QueryString.
 * Path parameters (specified with `:param_name`) must be present in the provided Schema.
 */
export function Delete<Path extends string>(path: Path) {
  return MethodReqProps2_("DELETE", path)
}
export function DeleteSpecial<Path extends string>(path: Path) {
  return MethodReqProps2_("POST", path)
}
/**
 * PUT http method.
 * Input parameters other than Path, will be sent as Body.
 * Path parameters (specified with `:param_name`) must be present in the provided Schema.
 */
export function Put<Path extends string>(path: Path) {
  return MethodReqProps2_("PUT", path)
}
export function PutSpecial<Path extends string>(path: Path) {
  return MethodReq_("PUT", path)
}

/**
 * GET http method.
 * Input parameters other than Path, will be sent as QueryString.
 * Path parameters (specified with `:param_name`) must be present in the provided Schema.
 */
export function Get<Path extends string>(path: Path) {
  return MethodReqProps2_("GET", path)
}
export function GetSpecial<Path extends string>(path: Path) {
  return MethodReq_("GET", path)
}
/**
 * PATCH http method.
 * Input parameters other than Path, will be sent as Body.
 * Path parameters (specified with `:param_name`) must be present in the provided Schema.
 */
export function Patch<Path extends string>(path: Path) {
  return MethodReqProps2_("PATCH", path)
}
export function PatchSpecial<Path extends string>(path: Path) {
  return MethodReq_("PATCH", path)
}
/**
 * POST http method.
 * Input parameters other than Path, will be sent as Body.
 * Path parameters (specified with `:param_name`) must be present in the provided Schema.
 */
export function Post<Path extends string>(path: Path) {
  return MethodReqProps2_("POST", path)
}
export function PostSpecial<Path extends string>(path: Path) {
  return MethodReq_("POST", path)
}

export function MethodReqProps2<Method extends Methods>(method: Method) {
  return <Path extends string>(path: Path) => MethodReqProps2_(method, path)
}

export function MethodReqProps2_<Method extends Methods, Path extends string>(
  method: Method,
  path: Path
) {
  return <M>(__name?: string) => {
    function a<Props extends MO.PropertyRecord = {}>(): BuildRequest<
      Props,
      Path,
      Method,
      M
    >
    function a<Props extends MO.PropertyRecord>(
      props: Props
    ): BuildRequest<Props, Path, Method, M>
    function a<Props extends MO.PropertyRecord>(props?: Props) {
      const req = Req<M>(__name)
      const r = props ? req(method, path, MO.props(props)) : req(method, path)
      return r
    }

    return a
  }
}

export function MethodReqProps<Method extends Methods>(method: Method) {
  return <M>() => {
    function a<Path extends string, Props extends MO.PropertyRecord = {}>(
      path: Path
    ): BuildRequest<Props, Path, Method, M>
    function a<Path extends string, Props extends MO.PropertyRecord>(
      path: Path,
      props: Props
    ): BuildRequest<Props, Path, Method, M>
    function a<Path extends string, Props extends MO.PropertyRecord>(
      path: Path,
      props?: Props
    ) {
      const req = Req<M>()
      const r = props ? req(method, path, MO.props(props)) : req(method, path)
      return r
    }

    return a
  }
}

export function MethodReq_<Method extends Methods, Path extends string>(
  method: Method,
  path: Path
) {
  return <M>(__name?: string) =>
    <Props extends MO.PropertyRecord>(self: MO.SchemaProperties<Props>) => {
      const req = Req<M>(__name)
      return req(method, path, self)
    }
}

/**
 * Automatically picks path, query and body, based on Path params and Request Method.
 */
export function Req<M>(__name?: string) {
  function a<
    Path extends string,
    Method extends Methods,
    Props extends MO.PropertyRecord = {}
  >(method: Method, path: Path): BuildRequest<Props, Path, Method, M>
  function a<
    Path extends string,
    Method extends Methods,
    Props extends MO.PropertyRecord
  >(
    method: Method,
    path: Path,
    self: MO.SchemaProperties<Props>
  ): BuildRequest<Props, Path, Method, M>
  function a<
    Path extends string,
    Method extends Methods,
    Props extends MO.PropertyRecord
  >(method: Method, path: Path, self?: MO.SchemaProperties<Props>) {
    return makeRequest<Props, Path, Method, M>(
      method,
      path,
      self ?? (MO.props({}) as any)
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
  Props extends MO.PropertyRecord,
  Path extends string,
  Method extends Methods,
  M
> = IfPathPropsProvided<
  Path,
  Props,
  Method extends "GET" | "DELETE"
    ? QueryRequest<
        M,
        MO.SchemaProperties<Pick<Props, PathParams<Path>>>,
        MO.SchemaProperties<Omit<Props, PathParams<Path>>>,
        undefined,
        MO.SchemaProperties<Props>
      >
    : BodyRequest<
        M,
        MO.SchemaProperties<Pick<Props, PathParams<Path>>>,
        MO.SchemaProperties<Omit<Props, PathParams<Path>>>,
        undefined,
        undefined,
        MO.SchemaProperties<Props>
      >
>

// NOTE: This ignores the original schema after building the new
export function makeRequest<
  Props extends MO.PropertyRecord,
  Path extends string,
  Method extends Methods,
  M
>(
  method: Method,
  path: Path,
  self: MO.SchemaProperties<Props>,
  __name?: string
): BuildRequest<Props, Path, Method, M> {
  const pathParams = parsePathParams(path)
  // TODO: path props must be parsed "from string"
  const remainProps = { ...self.Api.props }
  const pathProps = pathParams.length
    ? pathParams.reduce<Record<PathParams<Path>, any>>((prev, cur) => {
        prev[cur] = self.Api.props[cur]
        delete remainProps[cur]
        return prev
      }, {} as Record<PathParams<Path>, any>)
    : null

  const dest = method === "GET" || method === "DELETE" ? "query" : "body"
  const newSchema = {
    path: pathProps ? MO.props(pathProps) : undefined,
    // TODO: query props must be parsed "from string"

    [dest]: MO.props(remainProps),
  }
  if (method === "GET" || method === "DELETE") {
    return class extends QueryRequest<M>(__name)(
      method as ReadMethods,
      path,
      newSchema as any
    ) {} as any
  }
  return class extends BodyRequest<M>(__name)(
    method as WriteMethods,
    path,
    newSchema as any
  ) {} as any
}

export function adaptRequest<
  Props extends MO.PropertyRecord,
  Path extends string,
  Method extends Methods,
  M
>(req: Request<M, MO.SchemaProperties<Props>, Path, Method>) {
  return makeRequest<Props, Path, Method, M>(req.method, req.path, req[MO.schemaField])
}

export type Meta = { description?: string; summary?: string; openapiRef?: string }
export const metaIdentifier = MO.makeAnnotation<Meta>()
export function meta<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>(
  meta: Meta
) {
  return (self: MO.Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>) =>
    self.annotate(metaIdentifier, meta)
}
export const metaC = (m: Meta) => {
  return function (cls: any) {
    setSchema(cls, pipe(cls[schemaField], meta(m)) as any)
    return cls
  }
}

export type ReqRes<E, A> = MO.Schema<
  unknown, //ParserInput,
  A, //ParsedShape,
  any, //ConstructorInput,
  E, //Encoded,
  any //Api
>
export type ReqResSchemed<E, A> = {
  new (...args: any[]): any
  Encoder: MO.Encoder.Encoder<A, E>
  Model: ReqRes<E, A>
}

export type RequestSchemed<E, A> = ReqResSchemed<E, A> & {
  method: Methods
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
