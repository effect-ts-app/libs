import * as S from "@effect/schema/Schema"
import { flow } from "effect"

export * from "./Class.js"
export * as REST from "./REST.js"
export { Delete, Get, Patch, Post, Put, Req } from "./REST.js"

export { fromBrand, literal } from "./ext.js"
export { Int } from "./numbers.js"

export * from "./email.js"
export * from "./ext.js"
export * from "./moreStrings.js"
export * from "./numbers.js"
export * from "./phoneNumber.js"
export * from "./schema.js"
export * from "./strings.js"

export const Date = S.withDefaultConstructor(S.Date, () => new Date())
export const nullable = flow(S.nullable, (s) => S.withDefaultConstructor(s, () => null))
export const array = flow(S.array, (s) => S.withDefaultConstructor(s, () => []))
export const readonlySet = flow(S.readonlySet, (s) => S.withDefaultConstructor(s, () => new Set()))
export const readonlyMap = flow(S.readonlyMap, (s) => S.withDefaultConstructor(s, () => new Map()))

export * as ParseResult from "@effect/schema/ParseResult"

export { void as void_ } from "@effect/schema/Schema"
export * from "@effect/schema/Schema"
