// tracing: off

import { Case } from "@effect-ts/system/Case"

import type { AnyError } from "../_schema/index.js"
import { drawError } from "../_schema/index.js"
import { Parser, ParserEnv } from "../Parser/index.js"

/**
 * The Effect fails with the generic `E` type when the parser produces an invalid result
 * Otherwise success with the valid result.
 */
export function condemn<X, E, A>(
  self: Parser<X, E, A>
): (a: X, env?: ParserEnv) => Effect<never, E, A> {
  return (x, env?: ParserEnv) =>
    Effect.suspendSucceed(() => {
      const y = self(x, env).effect
      if (y._tag === "Left") {
        return Effect.fail(y.left)
      }
      const {
        tuple: [a, w],
      } = y.right
      return w._tag === "Some" ? Effect.fail(w.value) : Effect.succeed(a)
    })
}

export class CondemnException extends Case<{ readonly message: string }> {
  readonly _tag = "CondemnException"

  override toString() {
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
  return (a: X, env?: ParserEnv) =>
    Effect.suspendSucceed(() => {
      const res = self(a, env).effect
      if (res._tag === "Left") {
        return Effect.fail(new CondemnException({ message: drawError(res.left) }))
      }
      const warn = res.right.get(1)
      if (warn._tag === "Some") {
        return Effect.fail(new CondemnException({ message: drawError(warn.value) }))
      }
      return Effect(res.right.get(0))
    })
}

/**
 * The Effect dies with `ThrowableCondemnException` when the parser produces an invalid result.
 * Otherwise succeeds with the valid result.
 */
export function condemnDie<X, A>(self: Parser<X, AnyError, A>) {
  const orFail = condemnFail(self)
  return (a: X, env?: ParserEnv) => orFail(a, env).orDie
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
