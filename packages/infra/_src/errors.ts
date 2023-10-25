/* eslint-disable @typescript-eslint/ban-types */
import { makeFiberFailure } from "effect/Runtime"

export class NotFoundError<T extends string = string>
  extends Data.TaggedError("NotFoundError")<{ message: string; type: T; id: string }>
{
  constructor(args: { readonly type: T; readonly id: string }) {
    super({ ...args, message: `Didn't find ${args.type}#${args.id}` })
  }
}

export class ValidationError extends Data.TaggedError("ValidationError")<{ errors: ReadonlyArray<unknown> }> {}

export class NotLoggedInError extends Data.TaggedError("NotLoggedInError")<{}> {}

export class UnauthorizedError {
  public readonly _tag = "UnauthorizedError"
}

/**
 * The user carries a valid Userprofile, but there is a problem with the login none the less.
 */
export class LoginError extends Data.TaggedError("NotLoggeInError")<{ message: string }> {
  constructor(message: string) {
    super({ message })
  }
}

export class InvalidStateError extends Data.TaggedError("InvalidStateError")<{ message: string }> {
  constructor(message: string) {
    super({ message })
  }
}

export class CauseException<E> extends Error {
  constructor(readonly originalCause: Cause<E>, readonly _tag: string) {
    const limit = Error.stackTraceLimit
    Error.stackTraceLimit = 0
    super()
    Error.stackTraceLimit = limit
    const ff = makeFiberFailure(originalCause)
    this.name = ff.name
    this.message = ff.message
    this.stack = ff.stack
  }
  toJSON() {
    return {
      _tag: this._tag,
      name: this.name,
      message: this.message,
      pretty: this.toString(),
      cause: this.originalCause.toJSON()
    }
  }

  [Symbol.for("nodejs.util.inspect.custom")]() {
    return this.toJSON()
  }
  override toString() {
    return `[${this._tag}] ` + Cause.pretty(this.originalCause)
  }
}

export class OptimisticConcurrencyException extends Data.TaggedError("OptimisticConcurrencyException")<
  { type: string; id: string; current?: string; found?: string; message: string }
> {
  constructor(
    args: { readonly type: string; readonly id: string; readonly current?: string; readonly found?: string }
  ) {
    super({ ...args, message: `Existing ${args.type} ${args.id} record changed` })
  }
}
