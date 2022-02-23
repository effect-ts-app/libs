// tracing: off

import * as T from "@effect-ts/core/Effect"
import * as E from "@effect-ts/core/Either"
import { Case } from "@effect-ts/system/Case"

import type { AnyError } from "../_schema"
import { drawError } from "../_schema"
import { Parser, ParserEnv } from "../Parser"

/**
 * The Effect fails with the generic `E` type when the parser produces an invalid result
 * Otherwise success with the valid result.
 */
export function condemn<X, E, A>(
  self: Parser<X, E, A>
): (a: X, env?: ParserEnv) => T.IO<E, A> {
  return (x, env?: ParserEnv) =>
    T.suspend(() => {
      const y = self(x, env).effect
      if (y._tag === "Left") {
        return T.fail(y.left)
      }
      const {
        tuple: [a, w],
      } = y.right
      return w._tag === "Some" ? T.fail(w.value) : T.succeed(a)
    })
}

export class CondemnException extends Case<{ readonly message: string }> {
  readonly _tag = "CondemnException"

  toString() {
    return this.message
  }
}

export class ThrowableCondemnException extends Error {
  readonly _tag = "CondemnException"

  constructor(readonly error: AnyError) {
    super(drawError(error))
  }
}

/**
 * The Effect fails with `ThrowableCondemnException` when the parser produces an invalid result.
 * Otherwise succeeds with the valid result.
 */
export function condemnFail<X, A>(self: Parser<X, AnyError, A>) {
  return (a: X, env?: ParserEnv, __trace?: string) =>
    T.fromEither(() => {
      const res = self(a, env).effect
      if (res._tag === "Left") {
        return E.left(new CondemnException({ message: drawError(res.left) }))
      }
      const warn = res.right.get(1)
      if (warn._tag === "Some") {
        return E.left(new CondemnException({ message: drawError(warn.value) }))
      }
      return E.right(res.right.get(0))
    }, __trace)
}

/**
 * The Effect dies with `ThrowableCondemnException` when the parser produces an invalid result.
 * Otherwise succeeds with the valid result.
 */
export function condemnDie<X, A>(self: Parser<X, AnyError, A>) {
  const orFail = condemnFail(self)
  return (a: X, env?: ParserEnv, __trace?: string) => T.orDie(orFail(a, env, __trace))
}

/**
 * Throws a classic `ThrowableCondemnException` when the parser produces an invalid result.
 * Otherwise returns the valid result.
 */
export function unsafe<X, A>(self: Parser<X, AnyError, A>) {
  return (a: X, env?: ParserEnv) => {
    const res = self(a, env).effect
    if (res._tag === "Left") {
      throw new ThrowableCondemnException(res.left)
    }
    const warn = res.right.get(1)
    if (warn._tag === "Some") {
      throw new ThrowableCondemnException(warn.value)
    }
    return res.right.get(0)
  }
}
