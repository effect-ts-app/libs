// import "./EffectOption.ext.js"
import "./_ext/builtIn.js"
import "./_ext/date.js"
import "./_ext/misc.js"
import "./_ext/allLower.js"
import type { ParseOptions } from "@effect/schema/AST"
import { S } from "./schema.js"

/**
 * @tsplus fluent effect/schema/Schema withDefault
 */
export const defaultDate = <From>(s: S.Schema<From, Date>) => S.withDefaultConstructor(s, () => new Date())

/**
 * @tsplus fluent effect/schema/Schema withDefault
 */
export const defaultNullable = <From, To>(s: S.Schema<From, To | null>) => S.withDefaultConstructor(s, () => null)

/**
 * @tsplus fluent effect/schema/Schema withDefault
 */
export const defaultArray = <From, T>(s: S.Schema<From, ReadonlyArray<T>>) => S.withDefaultConstructor(s, () => [])

/**
 * @tsplus fluent effect/schema/Schema __call
 */
export const parseSync = <I, A>(self: S.Schema<I, A>, u: I, options?: ParseOptions | undefined) =>
  S.parseSync(self)(u, options)
