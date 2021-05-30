import {
  InternalServerError,
  MalformedRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../Errors"

import type {
  InternalServerErrorE,
  MalformedRequestErrorE,
  NotFoundErrorE,
  UnauthorizedErrorE,
} from "../Errors"
import type { ResponseCode } from "./code"
import type * as T from "@effect-ts/core/Effect"
import type { _R, UnionToIntersection } from "@effect-ts/core/Utils"
import type * as MO from "@effect-ts/morphic"

export type Type<E, A> = MO.M<{}, E, A>

export type Untagged<A> = Omit<A, "_tag">

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

export type Methods = GET | POST | PUT | PATCH | DELETE | OPTIONS | HEAD | TRACE

export interface Response<X extends Type<any, any>> {
  /**
   * Internal Tag
   */
  readonly _tag: "Response"
  /**
   * A short description of the response.
   * CommonMark syntax MAY be used for rich text representation.
   */
  readonly description: string
  /**
   * The type of the response
   */
  readonly content: X
}

export type ParameterLocation = "header" | "query" | "path" | "cookie"

export type StringType = Type<string, any>

export interface Parameter<X extends StringType, R extends boolean> {
  /**
   * Internal Tag
   */
  readonly _tag: "Parameter"
  /**
   * A brief description of the parameter.
   * This could contain examples of use.
   * CommonMark syntax MAY be used for rich text representation.
   */
  readonly description: string
  /**
   * The type of the parameter
   */
  readonly content: X
  /**
   * If the param is required
   */
  readonly required: R
  /**
   * Should extract to ref
   */
  readonly ref?: boolean
}

export interface ExternalDocs {
  /**
   * A short description of the target documentation.
   * CommonMark syntax MAY be used for rich text representation.
   */
  readonly description?: string
  /**
   * The URL for the target documentation.
   * Value MUST be in the format of a URL.
   */
  readonly url: string
}

export interface DefaultResponses {
  "400": Response<Type<MalformedRequestErrorE, MalformedRequestError>>
  "401": Response<Type<UnauthorizedErrorE, UnauthorizedError>>
  "404": Response<Type<NotFoundErrorE, NotFoundError>>
  "500": Response<Type<InternalServerErrorE, InternalServerError>>
}

export type ResponseRegistry = {
  [k in Exclude<ResponseCode, "400" | "500" | "200">]?: Response<any>
} & { "200": Response<any> } & DefaultResponses

export type ParameterRegistry<P extends string> = {
  [k in ParameterLocation]?: {
    [h in string]: Parameter<StringType, any>
  }
} &
  (keyof ExtractRouteParams<P> extends never
    ? {}
    : {
        path: {
          [h in keyof ExtractRouteParams<P>]: Parameter<StringType, any>
        }
      })

export type TagsType = readonly TagElement<any>[]

export type ExtractRouteParams<T extends string> = string extends T
  ? Record<string, string>
  : T extends `${infer _Start}{${infer Param}}${infer Rest}`
  ? { [k in Param | keyof ExtractRouteParams<Rest>]: string }
  : {}

export interface RequestBody<Env, B extends Type<any, any>, R extends boolean> {
  readonly _tag: "RequestBody"
  readonly description?: string
  readonly content: T.RIO<Env, B>
  readonly required: R
  readonly examples?: Record<string, B["_A"]>
}

export type Operation<
  Tags extends readonly string[],
  P extends string,
  X extends ResponseRegistry,
  Y extends ParameterRegistry<P>,
  RB extends
    | {
        /**
         * The request body applicable for this operation.
         * The requestBody is only supported in HTTP methods where the HTTP 1.1 specification
         * RFC7231 has explicitly defined semantics for request bodies. In other cases where
         * the HTTP spec is vague, requestBody SHALL be ignored by consumers.
         */
        [k in "requestBody"]: RequestBody<any, any, any>
      }
    | {}
> = {
  /**
   * Internal Tag
   */
  readonly _tag: "Operation"
  /**
   * The path of the operation
   */
  readonly path: P
  /**
   * A list of tags for API documentation control.
   * Tags can be used for logical grouping of operations by resources or
   * any other qualifier.
   */
  readonly tags: Tags
  /**
   * A verbose explanation of the operation behavior.
   * CommonMark syntax MAY be used for rich text representation.
   */
  readonly description?: string
  /**
   * A short summary of what the operation does.
   */
  readonly summary?: string
  /**
   * Additional external documentation for this operation.
   */
  readonly externalDocs?: ExternalDocs
  /**
   * Unique string used to identify the operation.
   * The id MUST be unique among all operations described in the API.
   * The operationId value is case-sensitive.
   * Tools and libraries MAY use the operationId to uniquely identify an operation,
   * therefore, it is RECOMMENDED to follow common programming naming conventions.
   */
  readonly operationId?: string
  /**
   * The list of possible responses as they are returned from executing this operation.
   */
  readonly responses: X
  /**
   * A list of parameters that are applicable for this operation.
   * If a parameter is already defined at the Path Item,
   * the new definition will override it but can never remove it.
   * The list MUST NOT include duplicated parameters.
   * A unique parameter is defined by a combination of a name and location.
   * The list can use the Reference Object to link to parameters that are defined at the
   * OpenAPI Object's components/parameters.
   */
  readonly parameters: Y
} & RB

export type AnyOperation<K extends string> = Operation<any, K, any, any, any>

export type OperationRegistry<K extends string> = {
  [k in Methods]?: AnyOperation<K>
}

export interface PathItem<Ms extends OperationRegistry<K>, K extends string> {
  /**
   * Internal Tag
   */
  readonly _tag: "PathItem"
  readonly summary?: string
  readonly description?: string
  readonly methods: Ms
  readonly path: K
}

export type AnyPath = PathItem<any, any>

export class Api<Paths extends PathRegistry, Tags extends readonly TagElement<any>[]> {
  /**
   * Internal Tag
   */
  readonly _tag = "Api"
  constructor(readonly info: Info, readonly paths: Paths, readonly tags: Tags) {}
}

export interface ContactInfo {
  /**
   * Internal Tag
   */
  readonly _tag: "ContactInfo"
  readonly name: string
  readonly url: string
  readonly email: string
}

export interface License {
  /**
   * Internal Tag
   */
  readonly _tag: "License"
  readonly name: string
  readonly url: string
}

export function contact(_: Untagged<ContactInfo>): ContactInfo {
  return {
    _tag: "ContactInfo",
    ..._,
  }
}

export function license(_: Untagged<License>): License {
  return {
    _tag: "License",
    ..._,
  }
}

export interface Info {
  /**
   * Internal Tag
   */
  readonly _tag: "Info"
  readonly title: string
  readonly pageTitle: string
  readonly version: string
  readonly description?: string
  readonly tos?: string
  readonly contact?: ContactInfo
  readonly license?: License
  readonly prefix?: string
}

export type PathRegistry = {
  [k in string]?: AnyPath
}

export function response<X extends Type<any, any>, C extends ResponseCode>(
  code: C,
  reponse: Untagged<Response<X>>
): { [k in C]: Response<X> } {
  return {
    [code]: {
      _tag: "Response",
      ...reponse,
    },
  } as any
}

export const MalformedRequestErrorResponse = response("400", {
  description: "A Malformed Request Error",
  content: MalformedRequestError,
})

export const UnauthorizedErrorResponse = response("401", {
  description: "A Unauthorized Error",
  content: UnauthorizedError,
})

export const NotFoundErrorResponse = response("404", {
  description: "A Not Found Error",
  content: NotFoundError,
})

export const InternalServerErrorResponse = response("500", {
  description: "A Unexpected Server Error",
  content: InternalServerError,
})

export function requestBody<Env, B extends Type<any, any>, R extends boolean>(
  required: R,
  b: Omit<Untagged<RequestBody<Env, B, any>>, "required">,
  examples?: Record<string, B["_A"]>
): RequestBody<Env, B, R> {
  return {
    _tag: "RequestBody",
    required,
    examples,
    ...b,
  }
}

export function info(i: Untagged<Info>): Info {
  return { _tag: "Info", ...i }
}

export interface TagElement<N extends string> {
  readonly _tag: "TagElement"
  readonly name: N
  readonly description?: string
  readonly externalDocs?: ExternalDocs
}

export function tag<N extends string>(x: Untagged<TagElement<N>>): TagElement<N> {
  return {
    _tag: "TagElement",
    ...x,
  }
}

export function tags<Tags extends readonly TagElement<any>[]>(...tags: Tags): Tags {
  return tags
}

export function parameter<
  Y extends Type<any, any>,
  K extends string,
  R extends boolean
>(
  name: K,
  required: R,
  param: Omit<Untagged<Parameter<Y, any>>, "required">
): { [k in K]: Parameter<Y, R> } {
  return {
    [name]: {
      _tag: "Parameter",
      required,
      ...param,
    },
  } as any
}

export function api<Tags extends readonly TagElement<any>[]>({
  info,
  tags,
}: {
  info: Info
  tags: Tags
}): <P extends PathRegistry>(
  paths: (_: {
    tags: <Ts extends Tags[number]["name"][]>(...tags: Ts) => Ts
    pathItem: <P extends string, X>(
      p: P,
      pi: (_: {
        operation: <
          O extends {
            readonly tags: readonly Tags[number]["name"][]
            readonly description?: string
            readonly summary?: string
            readonly externalDocs?: ExternalDocs
            readonly operationId?: string
            readonly responses: ResponseRegistry
            readonly parameters: ParameterRegistry<P>
            readonly requestBody?: RequestBody<any, any, any>
          }
        >(
          op: (_: {
            parameters: <Y extends ParameterRegistry<P>>(
              params: Y &
                ({} extends ExtractRouteParams<P>
                  ? unknown
                  : {
                      path: {
                        [k in keyof ExtractRouteParams<P>]: Parameter<StringType, any>
                      }
                    })
            ) => Y
          }) => O
        ) => O
        methods: <Ms extends OperationRegistry<P>>(methods: Ms) => Ms
      }) => Untagged<Omit<PathItem<X, P>, "path">>
    ) => { [p in P]: PathItem<X, P> }
    responses: <
      X extends {
        [k in Exclude<ResponseCode, "200" | keyof DefaultResponses>]?: Response<any>
      } & {
        "200": Response<any>
      }
    >(
      _: X
    ) => X & DefaultResponses
  }) => P
) => Api<P, Tags> {
  return (paths) =>
    new Api(
      info,
      paths({
        pathItem: (name, p) =>
          ({
            [name]: {
              _tag: "PathItem",
              ...p({
                operation: (op: any) => ({
                  _tag: "Operation",
                  ...op({
                    parameters: (p: any) => p,
                  }),
                }),
                methods: (_) => _,
              }),
            },
          } as any),
        tags: (...ts) => ts,
        responses: (_) => ({
          ..._,
          ...MalformedRequestErrorResponse,
          ...InternalServerErrorResponse,
          ...UnauthorizedErrorResponse,
          ...NotFoundErrorResponse,
        }),
      }),
      tags
    )
}

export type Responses<X extends ResponseRegistry> = {
  [k in keyof X]: X[k] extends Response<any> ? X[k]["content"] : never
}

export type TypeOf<X extends Api<any, any>> = X

export function get<P extends string>(path: P): `[GET]: ${P}` {
  return `[GET]: ${path}` as any
}

export function put<P extends string>(path: P): `[PUT]: ${P}` {
  return `[PUT]: ${path}` as any
}

export function patch<P extends string>(path: P): `[PATCH]: ${P}` {
  return `[PATCH]: ${path}` as any
}

export function options<P extends string>(path: P): `[OPTIONS]: ${P}` {
  return `[OPTIONS]: ${path}` as any
}

export function post<P extends string>(path: P): `[POST]: ${P}` {
  return `[POST]: ${path}` as any
}

export function del<P extends string>(path: P): `[DELETE]: ${P}` {
  return `[DELETE]: ${path}` as any
}

export function head<P extends string>(path: P): `[HEAD]: ${P}` {
  return `[HEAD]: ${path}` as any
}

export function trace<P extends string>(path: P): `[TRACE]: ${P}` {
  return `[TRACE]: ${path}` as any
}

export { ResponseCode } from "./code"

const true_ = true
const false_ = false

export { true_ as true, false_ as false }

export function optionalParameter<P extends { [k in keyof P]: Parameter<any, any> }>(
  p: P
): {
  [k in keyof P]: [P[k]] extends [Parameter<infer _T, infer _R>]
    ? Parameter<_T, false>
    : never
} {
  const q = {}
  for (const k of Object.keys(p)) {
    // @ts-expect-error
    q[k] = {
      // @ts-expect-error
      ...p[k],
      required: false,
    }
  }
  // @ts-expect-error
  return q
}

export function requiredParameter<P extends { [k in keyof P]: Parameter<any, any> }>(
  p: P
): {
  [k in keyof P]: [P[k]] extends [Parameter<infer _T, infer _R>]
    ? Parameter<_T, true>
    : never
} {
  const q = {}
  for (const k of Object.keys(p)) {
    // @ts-expect-error
    q[k] = {
      // @ts-expect-error
      ...p[k],
      required: true,
    }
  }
  // @ts-expect-error
  return q
}

export type BodyEnv<X extends Api<any, any>> = UnionToIntersection<
  {
    [k in keyof X["paths"]]: {
      [m in keyof X["paths"][k]["methods"]]: [X["paths"][k]["methods"][m]] extends [
        { requestBody: { content: infer RB } }
      ]
        ? unknown extends _R<RB>
          ? never
          : _R<RB>
        : never
    }[keyof X["paths"][k]["methods"]]
  }[keyof X["paths"]]
>
