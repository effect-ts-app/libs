// tracing: off

import type { Constructor } from "../_constructor.js"
import type { AnyError } from "../_schema.js"
import { drawError } from "../_schema.js"
import type { Parser, ParserEnv } from "../Parser.js"

/**
 * The Effect fails with the generic `E` type when the parser produces an invalid result
 * Otherwise success with the valid result.
 *
 * @tsplus getter ets/Schema/Parser condemn
 */
export function condemn<X, E, A>(
  self: Parser<X, E, A>
): (a: X, env?: ParserEnv) => Effect<never, E, A> {
  return (x, env?: ParserEnv) =>
    Effect.suspend(() => {
      const y = self(x, env).effect
      if (y._tag === "Left") {
        return Effect.fail(y.left)
      }
      const [a, w] = y.right
      return w._tag === "Some" ? Effect.fail(w.value) : Effect(a)
    })
}

export class CondemnException extends Data.TaggedError("CondemnException")<{ readonly message: string }> {
  constructor(message: string) {
    super({ message })
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
 *
 * @tsplus getter ets/Schema/Parser condemnFail
 */
export function condemnFail<X, A>(self: Parser<X, AnyError, A>) {
  return (a: X, env?: ParserEnv) =>
    Effect.suspend(() => {
      const res = self(a, env).effect
      if (res._tag === "Left") {
        return new CondemnException(drawError(res.left))
      }
      const warn = res.right[1]
      if (warn._tag === "Some") {
        return new CondemnException(drawError(warn.value))
      }
      return Effect(res.right[0])
    })
}

/**
 * The Effect dies with `ThrowableCondemnException` when the parser produces an invalid result.
 * Otherwise succeeds with the valid result.
 *
 * @tsplus getter ets/Schema/Parser condemnDie
 */
export function condemnDie<X, A>(self: Parser<X, AnyError, A>) {
  const orFail = condemnFail(self)
  return (a: X, env?: ParserEnv) => orFail(a, env).orDie
}

/**
 * Throws a classic `ThrowableCondemnException` when the parser produces an invalid result.
 * Otherwise returns the valid result.
 * @tsplus getter ets/Schema/Parser unsafe
 */
export function unsafe<X, A>(self: Parser<X, AnyError, A>) {
  return (a: X, env?: ParserEnv) => {
    const res = self(a, env).effect
    if (res._tag === "Left") {
      throw new ThrowableCondemnException(res.left)
    }
    const warn = res.right[1]
    if (warn._tag === "Some") {
      throw new ThrowableCondemnException(warn.value)
    }
    return res.right[0]
  }
}

/**
 * Throws a classic `ThrowableCondemnException` when the parser produces an invalid result.
 * Otherwise returns the valid result.
 * @tsplus getter ets/Schema/Parser unsafe
 */
export function unsafeCstr<X, A>(self: Constructor<X, A, AnyError>) {
  return (a: X) => {
    const res = self(a).effect
    if (res._tag === "Left") {
      throw new ThrowableCondemnException(res.left)
    }
    const warn = res.right[1]
    if (warn._tag === "Some") {
      throw new ThrowableCondemnException(warn.value)
    }
    return res.right[0]
  }
}
