/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as St from "@effect-ts/core/Structural"
import * as Lens from "@effect-ts/monocle/Lens"
import { Erase } from "@effect-ts-app/core/Effect"
import { ParsedShapeOf } from "@effect-ts-app/core/Schema/custom"
import { unsafe } from "@effect-ts-app/core/Schema/custom/_api/condemn"
import { Path } from "path-parser"

import { Compute } from "../Compute"
import { include } from "../Model"
import * as MO from "./_schema"
import { schemaField, SchemaForModel } from "./_schema"

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
export const nModelBrand = Symbol()
export const reqBrand = Symbol()

export type StringRecord = Record<string, string>

export type AnyRecord = Record<string, any>

export type AnyRecordSchema = MO.Schema<unknown, any, any, any, any, AnyRecord, any>
export type StringRecordSchema = MO.Schema<
  unknown,
  any,
  any,
  any,
  any,
  StringRecord,
  any
>

// Actually GET + DELETE
export interface QueryRequest<
  M,
  Path extends StringRecordSchema | undefined,
  Query extends StringRecordSchema | undefined,
  Headers extends StringRecordSchema | undefined,
  Self extends MO.SchemaAny
> extends Model<M, Self> {
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
> extends Model<M, Self> {
  Path: Path
  Body: Body
  Query: Query
  Headers: Headers
  path: string
  method: WriteMethods
  [reqBrand]: typeof reqBrand
}

// Not inheriting from Schemed because we don't want `copy`
// passing SelfM down to Model2 so we only compute it once.
export interface Model<M, Self extends MO.SchemaAny>
  extends Model2<M, Self, SchemaForModel<M, Self>> {}
export interface Model2<M, Self extends MO.SchemaAny, SelfM extends MO.SchemaAny>
  extends MO.Schema<
    MO.ParserInputOf<Self>,
    MO.NamedE<string, MO.ParserErrorOf<Self>>,
    M,
    MO.ConstructorInputOf<Self>,
    MO.NamedE<string, MO.ConstructorErrorOf<Self>>,
    MO.EncodedOf<Self>,
    MO.ApiOf<Self>
  > {
  new (_: Compute<MO.ConstructorInputOf<Self>>): Compute<MO.ParsedShapeOf<Self>>
  [MO.schemaField]: Self
  readonly Model: SelfM // added
  readonly lens: Lens.Lens<M, M> // added
  readonly lenses: RecordSchemaToLenses<M, Self>

  readonly Parser: MO.ParserFor<SelfM>
  readonly Constructor: MO.ConstructorFor<SelfM>
  readonly Encoder: MO.EncoderFor<SelfM>
  readonly Guard: MO.GuardFor<SelfM>
  readonly Arbitrary: MO.ArbitraryFor<SelfM>
}

type RequestString = "Request" | "default" | `${string}Request`

type Filter<U> = U extends RequestString ? U : never
export type GetRequestKey<U extends Record<RequestString | "Response", any>> = Filter<
  keyof U
>
export type GetRequest<U extends Record<RequestString | "Response", any>> = Filter<
  keyof U
> extends never
  ? never
  : U[Filter<keyof U>]

export function extractRequest<TModule extends Record<string, any>>(
  h: TModule
): GetRequest<TModule> {
  const reqKey =
    Object.keys(h).find((x) => x.endsWith("Request")) ||
    Object.keys(h).find((x) => x === "default")
  if (!reqKey) {
    throw new Error("Module appears to have no Request: " + Object.keys(h))
  }
  const Request = h[reqKey]
  return Request
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
    QueryParserError extends MO.SchemaError<any>,
    QueryParsedShape extends AnyRecord,
    QueryConstructorInput,
    QueryConstructorError extends MO.SchemaError<any>,
    QueryEncoded extends StringRecord,
    QueryApi,
    PathParserError extends MO.SchemaError<any>,
    PathParsedShape extends AnyRecord,
    PathConstructorInput,
    PathConstructorError extends MO.SchemaError<any>,
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
        PathParserError,
        PathParsedShape,
        PathConstructorInput,
        PathConstructorError,
        PathEncoded,
        PathApi
      >
      query: MO.Schema<
        unknown,
        QueryParserError,
        QueryParsedShape,
        QueryConstructorInput,
        QueryConstructorError,
        QueryEncoded,
        QueryApi
      >
    }
  ): QueryRequest<
    M,
    MO.Schema<
      unknown,
      PathParserError,
      PathParsedShape,
      PathConstructorInput,
      PathConstructorError,
      PathEncoded,
      PathApi
    >,
    MO.Schema<
      unknown,
      QueryParserError,
      QueryParsedShape,
      QueryConstructorInput,
      QueryConstructorError,
      QueryEncoded,
      QueryApi
    >,
    Headers,
    MO.Schema<
      unknown,
      MO.IntersectionE<
        MO.MemberE<0, QueryParserError> | MO.MemberE<1, PathParserError>
      >,
      QueryParsedShape & PathParsedShape,
      QueryConstructorInput & PathConstructorInput,
      MO.IntersectionE<
        MO.MemberE<0, QueryConstructorError> | MO.MemberE<1, PathConstructorError>
      >,
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
    // @ts-expect-error the following is correct
    return class extends ModelSpecial<M>(__name)(self["|>"](MO.annotate(reqId, {}))) {
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
    BodyParserError extends MO.SchemaError<any>,
    BodyParsedShape extends AnyRecord,
    BodyConstructorInput,
    BodyConstructorError extends MO.SchemaError<any>,
    BodyEncoded extends AnyRecord,
    BodyApi,
    QueryParserError extends MO.SchemaError<any>,
    QueryParsedShape extends AnyRecord,
    QueryConstructorInput,
    QueryConstructorError extends MO.SchemaError<any>,
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
        BodyParserError,
        BodyParsedShape,
        BodyConstructorInput,
        BodyConstructorError,
        BodyEncoded,
        BodyApi
      >
      query: MO.Schema<
        unknown,
        QueryParserError,
        QueryParsedShape,
        QueryConstructorInput,
        QueryConstructorError,
        QueryEncoded,
        QueryApi
      >
    }
  ): BodyRequest<
    M,
    undefined,
    MO.Schema<
      unknown,
      BodyParserError,
      BodyParsedShape,
      BodyConstructorInput,
      BodyConstructorError,
      BodyEncoded,
      BodyApi
    >,
    MO.Schema<
      unknown,
      QueryParserError,
      QueryParsedShape,
      QueryConstructorInput,
      QueryConstructorError,
      QueryEncoded,
      QueryApi
    >,
    Headers,
    MO.Schema<
      unknown,
      MO.IntersectionE<
        MO.MemberE<0, BodyParserError> | MO.MemberE<1, QueryParserError>
      >,
      BodyParsedShape & QueryParsedShape,
      BodyConstructorInput & QueryConstructorInput,
      MO.IntersectionE<
        MO.MemberE<0, BodyConstructorError> | MO.MemberE<1, QueryConstructorError>
      >,
      BodyEncoded & QueryEncoded,
      {}
    >
  >
  function a<
    QueryParserError extends MO.SchemaError<any>,
    QueryParsedShape extends AnyRecord,
    QueryConstructorInput,
    QueryConstructorError extends MO.SchemaError<any>,
    QueryEncoded extends StringRecord,
    QueryApi,
    PathParserError extends MO.SchemaError<any>,
    PathParsedShape extends AnyRecord,
    PathConstructorInput,
    PathConstructorError extends MO.SchemaError<any>,
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
        PathParserError,
        PathParsedShape,
        PathConstructorInput,
        PathConstructorError,
        PathEncoded,
        PathApi
      >
      query: MO.Schema<
        unknown,
        QueryParserError,
        QueryParsedShape,
        QueryConstructorInput,
        QueryConstructorError,
        QueryEncoded,
        QueryApi
      >
    }
  ): BodyRequest<
    M,
    MO.Schema<
      unknown,
      PathParserError,
      PathParsedShape,
      PathConstructorInput,
      PathConstructorError,
      PathEncoded,
      PathApi
    >,
    MO.Schema<
      unknown,
      QueryParserError,
      QueryParsedShape,
      QueryConstructorInput,
      QueryConstructorError,
      QueryEncoded,
      QueryApi
    >,
    undefined,
    Headers,
    MO.Schema<
      unknown,
      MO.IntersectionE<
        MO.MemberE<0, QueryParserError> | MO.MemberE<1, PathParserError>
      >,
      QueryParsedShape & PathParsedShape,
      QueryConstructorInput & PathConstructorInput,
      MO.IntersectionE<
        MO.MemberE<0, QueryConstructorError> | MO.MemberE<1, PathConstructorError>
      >,
      QueryEncoded & PathEncoded,
      {}
    >
  >
  function a<
    BodyParserError extends MO.SchemaError<any>,
    BodyParsedShape extends AnyRecord,
    BodyConstructorInput,
    BodyConstructorError extends MO.SchemaError<any>,
    BodyEncoded extends AnyRecord,
    BodyApi,
    PathParserError extends MO.SchemaError<any>,
    PathParsedShape extends AnyRecord,
    PathConstructorInput,
    PathConstructorError extends MO.SchemaError<any>,
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
        PathParserError,
        PathParsedShape,
        PathConstructorInput,
        PathConstructorError,
        PathEncoded,
        PathApi
      >
      body: MO.Schema<
        unknown,
        BodyParserError,
        BodyParsedShape,
        BodyConstructorInput,
        BodyConstructorError,
        BodyEncoded,
        BodyApi
      >
    }
  ): BodyRequest<
    M,
    MO.Schema<
      unknown,
      PathParserError,
      PathParsedShape,
      PathConstructorInput,
      PathConstructorError,
      PathEncoded,
      PathApi
    >,
    MO.Schema<
      unknown,
      BodyParserError,
      BodyParsedShape,
      BodyConstructorInput,
      BodyConstructorError,
      BodyEncoded,
      BodyApi
    >,
    undefined,
    Headers,
    MO.Schema<
      unknown,
      MO.IntersectionE<MO.MemberE<0, BodyParserError> | MO.MemberE<1, PathParserError>>,
      BodyParsedShape & PathParsedShape,
      BodyConstructorInput & PathConstructorInput,
      MO.IntersectionE<
        MO.MemberE<0, BodyConstructorError> | MO.MemberE<1, PathConstructorError>
      >,
      BodyEncoded & PathEncoded,
      {}
    >
  >
  function a<
    BodyParserError extends MO.SchemaError<any>,
    BodyParsedShape extends AnyRecord,
    BodyConstructorInput,
    BodyConstructorError extends MO.SchemaError<any>,
    BodyEncoded extends AnyRecord,
    BodyApi,
    PathParserError extends MO.SchemaError<any>,
    PathParsedShape extends AnyRecord,
    PathConstructorInput,
    PathConstructorError extends MO.SchemaError<any>,
    PathEncoded extends StringRecord,
    PathApi,
    QueryParserError extends MO.SchemaError<any>,
    QueryParsedShape extends AnyRecord,
    QueryConstructorInput,
    QueryConstructorError extends MO.SchemaError<any>,
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
        PathParserError,
        PathParsedShape,
        PathConstructorInput,
        PathConstructorError,
        PathEncoded,
        PathApi
      >
      body: MO.Schema<
        unknown,
        BodyParserError,
        BodyParsedShape,
        BodyConstructorInput,
        BodyConstructorError,
        BodyEncoded,
        BodyApi
      >
      query: MO.Schema<
        unknown,
        QueryParserError,
        QueryParsedShape,
        QueryConstructorInput,
        QueryConstructorError,
        QueryEncoded,
        QueryApi
      >
    }
  ): BodyRequest<
    M,
    MO.Schema<
      unknown,
      PathParserError,
      PathParsedShape,
      PathConstructorInput,
      PathConstructorError,
      PathEncoded,
      PathApi
    >,
    MO.Schema<
      unknown,
      BodyParserError,
      BodyParsedShape,
      BodyConstructorInput,
      BodyConstructorError,
      BodyEncoded,
      BodyApi
    >,
    MO.Schema<
      unknown,
      QueryParserError,
      QueryParsedShape,
      QueryConstructorInput,
      QueryConstructorError,
      QueryEncoded,
      QueryApi
    >,
    Headers,
    MO.Schema<
      unknown,
      MO.IntersectionE<
        | MO.MemberE<0, BodyParserError>
        | MO.MemberE<1, PathParserError>
        | MO.MemberE<2, QueryParserError>
      >,
      BodyParsedShape & PathParsedShape & QueryParsedShape,
      BodyConstructorInput & PathConstructorInput & QueryConstructorInput,
      MO.IntersectionE<
        | MO.MemberE<0, BodyConstructorError>
        | MO.MemberE<1, PathConstructorError>
        | MO.MemberE<2, QueryConstructorError>
      >,
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
    // @ts-expect-error the following is correct
    return class extends ModelSpecial<M>(__name)(self["|>"](MO.annotate(reqId, {}))) {
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

export type PathParams<Path extends string> =
  Path extends `:${infer Param}/${infer Rest}`
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

export type PropsExtensions<Props extends MO.PropertyRecord> = {
  include: <NewProps extends Record<string, MO.AnyProperty>>(
    fnc: (props: Props) => NewProps
  ) => NewProps
}

export function Model<M>(__name?: string) {
  return <Props extends MO.PropertyRecord = {}>(props: Props) =>
    ModelSpecial<M>(__name)(MO.props(props))
}

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
  const params = p.params as PathParams<Path>[]
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
  const params = parsePathParams(path)
  // TODO: path props must be parsed "from string"
  const remainProps = { ...self.Api.props }
  const pathProps = params.length
    ? params.reduce<Record<PathParams<Path>, any>>((prev, cur) => {
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

export type RecordSchemaToLenses<T, Self extends AnyRecordSchema> = {
  [K in keyof ParsedShapeOf<Self>]: Lens.Lens<T, ParsedShapeOf<Self>[K]>
}

export type PropsToLenses<T, Props extends MO.PropertyRecord> = {
  [K in keyof Props]: Lens.Lens<T, MO.ParsedShapeOf<Props[K]["_schema"]>>
}
export function lensFromProps<T>() {
  return <Props extends MO.PropertyRecord>(props: Props): PropsToLenses<T, Props> => {
    const id = Lens.id<T>()
    return Object.keys(props).reduce((prev, cur) => {
      prev[cur] = id["|>"](Lens.prop(cur as any))
      return prev
    }, {} as any)
  }
}

function setSchema<Self extends MO.SchemaProperties<any>>(schemed: any, self: Self) {
  schemed[MO.SchemaContinuationSymbol] = schemed[schemaField] = schemed.Model = self

  // Object.defineProperty(schemed, MO.SchemaContinuationSymbol, {
  //   value: self,
  // })

  Object.defineProperty(schemed, "include", {
    value: include(self.Api.props),
    configurable: true,
  })

  Object.defineProperty(schemed, "lenses", {
    value: lensFromProps()(self.Api.props),
    configurable: true,
  })
  Object.defineProperty(schemed, "Api", {
    value: self.Api,
    configurable: true,
  })

  Object.defineProperty(schemed, ">>>", {
    value: self[">>>"],
    configurable: true,
  })

  Object.defineProperty(schemed, "Parser", {
    value: MO.Parser.for(self),
    configurable: true,
  })

  Object.defineProperty(schemed, "Constructor", {
    value: MO.Constructor.for(self),
    configurable: true,
  })

  Object.defineProperty(schemed, "Encoder", {
    value: MO.Encoder.for(self),
    configurable: true,
  })

  Object.defineProperty(schemed, "Guard", {
    value: MO.Guard.for(self),
    configurable: true,
  })

  Object.defineProperty(schemed, "Arbitrary", {
    value: MO.Arbitrary.for(self),
    configurable: true,
  })

  Object.defineProperty(schemed, "annotate", {
    value: <Meta>(identifier: MO.Annotation<Meta>, meta: Meta) =>
      new MO.SchemaAnnotated(self, identifier, meta),
    configurable: true,
  })
}

export type Meta = { description?: string; summary?: string; openapiRef?: string }
export const metaIdentifier = MO.makeAnnotation<Meta>()
export function meta<
  ParserInput,
  ParserError,
  ParsedShape,
  ConstructorInput,
  ConstructorError,
  Encoded,
  Api
>(meta: Meta) {
  return (
    self: MO.Schema<
      ParserInput,
      ParserError,
      ParsedShape,
      ConstructorInput,
      ConstructorError,
      Encoded,
      Api
    >
  ) => self.annotate(metaIdentifier, meta)
}
export const metaC = (m: Meta) => {
  return function (cls: any) {
    setSchema(cls, cls[schemaField]["|>"](meta(m)))
    return cls
  }
}

/**
 * Automatically assign the name of the Class to the Schema.
 */
export function useClassNameForSchema(cls: any) {
  setSchema(cls, cls[schemaField]["|>"](MO.named(cls.name)))
  return cls
}

type GetProps<Self> = Self extends { Api: { props: infer Props } }
  ? Props extends MO.PropertyRecord
    ? Props
    : never
  : never

// We don't want Copy interface from the official implementation
export function ModelSpecial<M>(__name?: string) {
  return <Self extends MO.SchemaAny & { Api: { props: any } }>(
    self: Self
  ): Model<M, Self> & PropsExtensions<GetProps<Self>> => {
    const schema = __name ? self["|>"](MO.named(__name)) : self // TODO  ?? "Model(Anonymous)", but atm auto deriving openapiRef from this.
    const of_ = MO.Constructor.for(schema)["|>"](unsafe)
    const fromFields = (fields: any, target: any) => {
      for (const k of Object.keys(fields)) {
        target[k] = fields[k]
      }
    }

    // @ts-expect-error the following is correct
    return class {
      static [nModelBrand] = nModelBrand

      static [schemaField] = schema
      static [MO.SchemaContinuationSymbol] = schema
      static Model = schema
      static Api = schema.Api
      static [">>>"] = schema[">>>"]

      static Parser = MO.Parser.for(schema)
      static Encoder = MO.Encoder.for(schema)
      static Constructor = MO.Constructor.for(schema)
      static Guard = MO.Guard.for(schema)
      static Arbitrary = MO.Arbitrary.for(schema)

      static lens = Lens.id<any>()
      static lenses = lensFromProps()(schema.Api.props)

      static include = include(schema.Api.props)

      static annotate = <Meta>(identifier: MO.Annotation<Meta>, meta: Meta) =>
        new MO.SchemaAnnotated(self, identifier, meta)

      constructor(inp?: MO.ConstructorInputOf<Self>) {
        if (inp) {
          fromFields(of_(inp), this)
        }
      }
      get [St.hashSym](): number {
        const ka = Object.keys(this).sort()
        if (ka.length === 0) {
          return 0
        }
        let hash = St.combineHash(St.hashString(ka[0]!), St.hash(this[ka[0]!]))
        let i = 1
        while (hash && i < ka.length) {
          hash = St.combineHash(
            hash,
            St.combineHash(St.hashString(ka[i]!), St.hash(this[ka[i]!]))
          )
          i++
        }
        return hash
      }

      [St.equalsSym](that: unknown): boolean {
        if (!(that instanceof this.constructor)) {
          return false
        }
        const ka = Object.keys(this)
        const kb = Object.keys(that)
        if (ka.length !== kb.length) {
          return false
        }
        let eq = true
        let i = 0
        const ka_ = ka.sort()
        const kb_ = kb.sort()
        while (eq && i < ka.length) {
          eq = ka_[i] === kb_[i] && St.equals(this[ka_[i]!], this[kb_[i]!])
          i++
        }
        return eq
      }
      // static copy(this, that) {
      //   return fromFields(that, this)
      // }
    }
  }
}
export type ReqRes<E, A> = MO.Schema<
  unknown, //ParserInput,
  any, // MO.any //ParserError,
  A, //ParsedShape,
  any, //ConstructorInput,
  any, //ConstructorError,
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
