import type { ParseOptions } from "@effect/schema/AST"
import * as S from "@effect/schema/Schema"
import type { Schema } from "@effect/schema/Schema"
import type { Effect, Either } from "effect"
import type { ParseResult } from "./index.js"

export const getSchema = <S extends Schema<any, any, any>>(
  s: S
): S extends { struct: Schema<infer R, infer From, infer To> } ? Schema<R, From, To> : S => {
  const s_ = s as { struct?: any }
  return "struct" in s_ ? s_.struct : s
}

/**
 * @category encoding
 * @since 1.0.0
 */
export const encodeUnknownSync = <I, A>(
  schema: Schema<never, I, A>,
  options?: ParseOptions
) => S.encodeUnknownSync(getSchema(schema), options)

/**
 * @category encoding
 * @since 1.0.0
 */
export const encodeUnknown = <R, I, A>(
  schema: Schema<R, I, A>,
  options?: ParseOptions
) => S.encodeUnknown(getSchema(schema), options)

/**
 * @category encoding
 * @since 1.0.0
 */
export const encodeUnknownEither = <I, A>(
  schema: Schema<never, I, A>,
  options?: ParseOptions
) => S.encodeUnknownEither(getSchema(schema), options)

/**
 * @category encoding
 * @since 1.0.0
 */
export const encodeUnknownPromise = <I, A>(
  schema: Schema<never, I, A>,
  options?: ParseOptions
) => S.encodeUnknownPromise(getSchema(schema), options)

/**
 * @category encoding
 * @since 1.0.0
 */
export const encodeSync = <I, A>(
  schema: Schema<never, I, A>,
  options?: ParseOptions
) => S.encodeSync(getSchema(schema), options)

/**
 * @category encoding
 * @since 1.0.0
 */
export const encode: <R, I, A>(
  schema: Schema<R, I, A>,
  options?: ParseOptions
) => (a: A, overrideOptions?: ParseOptions) => Effect.Effect<R, ParseResult.ParseError, I> = encodeUnknown

/**
 * @category encoding
 * @since 1.0.0
 */
export const encodeEither: <I, A>(
  schema: Schema<never, I, A>,
  options?: ParseOptions
) => (a: A, overrideOptions?: ParseOptions) => Either.Either<ParseResult.ParseError, I> = encodeUnknownEither

/**
 * @category encoding
 * @since 1.0.0
 */
export const encodePromise: <I, A>(
  schema: Schema<never, I, A>,
  options?: ParseOptions
) => (a: A, overrideOptions?: ParseOptions) => Promise<I> = encodeUnknownPromise

export * from "@effect/schema/Schema"
