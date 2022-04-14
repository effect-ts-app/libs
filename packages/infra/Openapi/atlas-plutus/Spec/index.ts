/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { _R } from "@effect-ts/core/Utils"

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

export type ParameterLocation = "header" | "query" | "path" | "cookie"

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

export type ExtractRouteParams<T extends string> = string extends T
  ? Record<string, string>
  : T extends `${infer _Start}{${infer Param}}${infer Rest}`
  ? { [k in Param | keyof ExtractRouteParams<Rest>]: string }
  : {}

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

export { ResponseCode } from "./code.js"

const true_ = true
const false_ = false

export { true_ as true, false_ as false }
