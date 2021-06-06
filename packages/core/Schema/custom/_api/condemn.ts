// tracing: off

import * as T from "@effect-ts/core/Effect"
import * as E from "@effect-ts/core/Either"
import { Case } from "@effect-ts/system/Case"

import { drawError } from "../_schema"
import type { These } from "../These"

export function condemn<X, E, A>(self: (a: X) => These<E, A>): (a: X) => T.IO<E, A> {
  return (x) =>
    T.suspend(() => {
      const y = self(x).effect
      if (y._tag === "Left") {
        return T.fail(y.left)
      }
      const {
        tuple: [a, w]
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

  constructor(readonly error: unknown) {
    super(drawError(error as any)) // TODO
  }
}

export function condemnFail<X, A>(self: (a: X) => These<unknown, A>) {
  return (a: X, __trace?: string) =>
    T.fromEither(() => {
      const res = self(a).effect
      if (res._tag === "Left") {
        return E.left(new CondemnException({ message: drawError(res.left as any) }))
      }
      const warn = res.right.get(1)
      if (warn._tag === "Some") {
        return E.left(new CondemnException({ message: drawError(warn.value as any) }))
      }
      return E.right(res.right.get(0))
    }, __trace)
}

export function condemnDie<X, A>(self: (a: X) => These<unknown, A>) {
  const orFail = condemnFail(self)
  return (a: X, __trace?: string) => T.orDie(orFail(a, __trace))
}

export function unsafe<X, A>(self: (a: X) => These<unknown, A>) {
  return (a: X) => {
    const res = self(a).effect
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
