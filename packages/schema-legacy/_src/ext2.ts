/* eslint-disable @typescript-eslint/no-explicit-any */

// We're using getters with curried functions, instead of fluent functions, so that they can be used directly in lambda callbacks

import { EParserFor } from "./_api/_shared.js"
import type { AnyError, Schema } from "./custom.js"
import { unsafe } from "./custom/_api/condemn.js"
import { drawError } from "./custom/_schema/error.js"
import * as Encoder from "./custom/Encoder.js"
import * as Parser from "./custom/Parser.js"

export class CustomSchemaException
  extends Data.TaggedError("ValidationError")<{ errors: ReadonlyArray<unknown>; message: string }>
{
  constructor(error: AnyError) {
    super({ errors: [error], message: drawError(error) })
  }
}

/**
 * The Effect fails with `CustomSchemaException` when the parser produces an invalid result.
 * Otherwise succeeds with the valid result.
 */
export function condemnCustom_<X, A>(
  self: Parser.Parser<X, AnyError, A>,
  a: X,
  env?: Parser.ParserEnv
) {
  return Effect.suspend(() => {
    const res = self(a, env).effect
    if (res._tag === "Left") {
      return new CustomSchemaException(res.left)
    }
    const warn = res.right[1]
    if (warn._tag === "Some") {
      return new CustomSchemaException(warn.value)
    }
    return Effect(res.right[0])
  })
}

/**
 * The Effect fails with the generic `E` type when the parser produces an invalid result
 * Otherwise success with the valid result.
 */
export function condemn_<X, E, A>(
  self: Parser.Parser<X, E, A>,
  x: X,
  env?: Parser.ParserEnv
) {
  return Effect.suspend(() => {
    const y = self(x, env).effect
    if (y._tag === "Left") {
      return Effect.fail(y.left)
    }
    const [a, w] = y.right
    return w._tag === "Some"
      ? Effect.fail(w.value)
      : Effect(a)
  })
}

/**
 * @tsplus getter ets/Schema/Schema encodeSync
 */
export function encodeSync<B, C, D, E>(self: Schema<unknown, B, C, D, E>) {
  const encoder = Encoder.for(self)
  return (a: B) => {
    return encoder(a)
  }
}

/**
 * @tsplus getter ets/Schema/Parser condemnCustom
 */
export function condemnCustom<X, A>(self: Parser.Parser<X, AnyError, A>) {
  return (a: X, env?: Parser.ParserEnv) => condemnCustom_(self, a, env)
}

export function condemnLeft_<X, A>(
  self: Parser.Parser<X, AnyError, A>,
  a: X,
  env?: Parser.ParserEnv
): Either<CustomSchemaException, A> {
  const res = self(a, env).effect
  if (res._tag === "Left") {
    return Either.left(new CustomSchemaException(res.left))
  }
  const warn = res.right[1]
  if (warn._tag === "Some") {
    return Either.left(new CustomSchemaException(warn.value))
  }
  return Either(res.right[0])
}

/**
 * @tsplus getter ets/Schema/Parser condemnLeft
 */
export function condemnLeft<X, A>(self: Parser.Parser<X, AnyError, A>) {
  return (a: X, env?: Parser.ParserEnv) => condemnLeft_(self, a, env)
}

export function parseCondemnCustom_<A, B, C, D, E>(
  self: Schema<A, B, C, D, E>,
  a: A,
  env?: Parser.ParserEnv,
  __trace?: string
) {
  const parser = Parser.for(self)
  return condemnCustom_(parser, a, env)
}

export function parseFromCondemnCustom_<B, C, D, E>(
  self: Schema<unknown, B, C, D, E>,
  a: D,
  env?: Parser.ParserEnv,
  __trace?: string
) {
  const parser = EParserFor(self)
  return condemnCustom_(parser, a, env)
}

/**
 * The Effect dies with `ThrowableCondemnException` when the parser produces an invalid result.
 * Otherwise succeeds with the valid result.
 */
export function condemnDie_<X, A>(
  self: Parser.Parser<X, AnyError, A>,
  a: X,
  env?: Parser.ParserEnv,
  __trace?: string
) {
  const cl = condemnLeft(self)
  return cl(a, env).orDie
}

export function parseCondemnDie_<A, B, C, D, E>(
  self: Schema<A, B, C, D, E>,
  a: A,
  env?: Parser.ParserEnv,
  __trace?: string
) {
  const parser = Parser.for(self)
  return condemnDie_(parser, a, env)
}

export function parseFromCondemnDie_<B, C, D, E>(
  self: Schema<unknown, B, C, D, E>,
  a: D,
  env?: Parser.ParserEnv,
  __trace?: string
) {
  const parser = EParserFor(self)
  return condemnDie_(parser, a, env)
}

/**
 * @tsplus getter ets/Schema/Schema parseFromCondemnDie
 */
export function parseFromCondemnDie<B, C, D, E>(self: Schema<unknown, B, C, D, E>) {
  const parser = EParserFor(self)
  return (a: D, env?: Parser.ParserEnv) => {
    return condemnDie_(parser, a, env)
  }
}

/**
 * @tsplus getter ets/Schema/Schema parseFromEither
 */
export function parseFromEither<B, C, D, E>(self: Schema<unknown, B, C, D, E>) {
  const parser = EParserFor(self)
  return (a: D, env?: Parser.ParserEnv) => {
    return condemnFail_(parser, a, env)
  }
}

/**
 * @tsplus getter ets/Schema/Schema parseFromCondemnLeft
 */
export function parseFromCondemnLeft<B, C, D, E>(self: Schema<unknown, B, C, D, E>) {
  const parser = EParserFor(self)
  return (a: D, env?: Parser.ParserEnv) => {
    return condemnLeft_(parser, a, env)
  }
}

/**
 * @tsplus getter ets/Schema/Schema parseFromCondemnCustom
 */
export function parseFromCondemnCustom<B, C, D, E>(self: Schema<unknown, B, C, D, E>) {
  const parser = EParserFor(self)
  return (a: D, env?: Parser.ParserEnv) => {
    return condemnCustom_(parser, a, env)
  }
}

/**
 * @tsplus getter ets/Schema/Schema parseCondemnDie
 */
export function parseCondemnDie<A, B, C, D, E>(self: Schema<A, B, C, D, E>) {
  const parser = Parser.for(self)
  return (a: A, env?: Parser.ParserEnv) => {
    return condemnDie_(parser, a, env)
  }
}

/**
 * @tsplus getter ets/Schema/Schema parseEither
 */
export function parseEither<A, B, C, D, E>(self: Schema<A, B, C, D, E>) {
  return (a: A, env?: Parser.ParserEnv) => {
    const parser = Parser.for(self)
    return condemnFail_(parser, a, env)
  }
}

/**
 * @tsplus getter ets/Schema/Schema parseCondemnLeft
 */
export function parseCondemnLeft<A, B, C, D, E>(self: Schema<A, B, C, D, E>) {
  const parser = Parser.for(self)
  return (a: A, env?: Parser.ParserEnv) => {
    return condemnLeft_(parser, a, env)
  }
}

/**
 * @tsplus getter ets/Schema/Schema parseCondemnCustom
 */
export function parseCondemnCustom<A, B, C, D, E>(self: Schema<A, B, C, D, E>) {
  const parser = Parser.for(self)
  return (a: A, env?: Parser.ParserEnv) => {
    return condemnCustom_(parser, a, env)
  }
}

/**
 * @tsplus getter ets/Schema/Schema parseCondemn
 */
export function parseCondemn<A, B, C, D, E>(self: Schema<A, B, C, D, E>) {
  const parser = Parser.for(self)
  return (a: A, env?: Parser.ParserEnv) => {
    return condemn_(parser, a, env)
  }
}

export function parseFromCondemn_<B, C, D, E>(
  self: Schema<unknown, B, C, D, E>,
  a: D,
  env?: Parser.ParserEnv,
  __trace?: string
) {
  const parser = EParserFor(self)
  return condemn_(parser, a, env)
}

/**
 * @tsplus getter ets/Schema/Schema parseFromCondemn
 */
export function parseFromCondemn<B, C, D, E>(self: Schema<unknown, B, C, D, E>) {
  const parser = EParserFor(self)
  return (a: D, env?: Parser.ParserEnv) => {
    return condemn_(parser, a, env)
  }
}

/**
 * @tsplus getter ets/Schema/Schema parseSync
 */
export function parseSync<A, B, C, D, E>(self: Schema<A, B, C, D, E>) {
  const parser = Parser.for(self)
  const uns = unsafe(parser)
  return (a: A, env?: Parser.ParserEnv) => {
    return uns(a, env)
  }
}

/**
 * @tsplus getter ets/Schema/Schema parseFromSync
 */
export function parseFromSync<B, C, D, E>(self: Schema<unknown, B, C, D, E>) {
  const parser = EParserFor(self)
  const uns = unsafe(parser)
  return (a: D, env?: Parser.ParserEnv) => {
    return uns(a, env)
  }
}

/**
 * The Effect fails with `ThrowableCondemnException` when the parser produces an invalid result.
 * Otherwise succeeds with the valid result.
 */
export function condemnFail_<X, A>(
  self: Parser.Parser<X, AnyError, A>,
  a: X,
  env?: Parser.ParserEnv,
  __trace?: string
) {
  const cl = condemnLeft(self)
  return cl(a, env)
}

export function parseCondemnFail_<A, B, C, D, E>(
  self: Schema<A, B, C, D, E>,
  a: A,
  env?: Parser.ParserEnv,
  __trace?: string
) {
  const parser = Parser.for(self)
  return condemnFail_(parser, a, env)
}

export function parseFromCondemnFail_<B, C, D, E>(
  self: Schema<unknown, B, C, D, E>,
  a: D,
  env?: Parser.ParserEnv,
  __trace?: string
) {
  const parser = EParserFor(self)
  return condemnFail_(parser, a, env)
}

export function parseCondemnLeft_<A, B, C, D, E>(
  self: Schema<A, B, C, D, E>,
  a: A,
  env?: Parser.ParserEnv
) {
  const parser = Parser.for(self)
  return condemnLeft_(parser, a, env)
}

export function parseFromCondemnLeft_<B, C, D, E>(
  self: Schema<unknown, B, C, D, E>,
  a: D,
  env?: Parser.ParserEnv
) {
  const parser = EParserFor(self)
  return condemnLeft_(parser, a, env)
}
