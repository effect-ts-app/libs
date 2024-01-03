/* eslint-disable @typescript-eslint/ban-types */
import { makeFiberFailure } from "effect/Runtime"

/** @tsplus type NotFoundError */
export class NotFoundError<Id, T extends string = string>
  extends Data.TaggedError("NotFoundError")<{ message: string; type: T; id: Id }>
{
  constructor(args: { readonly type: T; readonly id: Id }) {
    super({ ...args, message: `Didn't find ${args.type}#${JSON.stringify(args.id)}` })
  }
}

/** @tsplus type ValidationError */
export class ValidationError extends Data.TaggedError("ValidationError")<{ errors: ReadonlyArray<unknown> }> {
  override get message() {
    return `Validation failed: ${this.errors.map((e) => JSON.stringify(e)).join(", ")}`
  }
}

/** @tsplus type NotLoggedInError */
export class NotLoggedInError extends Data.TaggedError("NotLoggedInError")<{ message?: string | undefined }> {
  constructor(message?: string) {
    super({ message })
  }
}

/** @tsplus type UnauthorizedError */
export class UnauthorizedError extends Data.TaggedError("UnauthorizedError")<{ message?: string | undefined }> {
  constructor(message?: string) {
    super({ message })
  }
}

/**
 * The user carries a valid Userprofile, but there is a problem with the login none the less.
 */
/** @tsplus type LoginError */
export class LoginError extends Data.TaggedError("NotLoggeInError")<{ message: string }> {
  constructor(message: string) {
    super({ message })
  }
}

/** @tsplus type InvalidStateError */
export class InvalidStateError extends Data.TaggedError("InvalidStateError")<{ message: string }> {
  constructor(message: string) {
    super({ message })
  }
}

/** @tsplus type CauseException */
export class CauseException<E> extends Error {
  constructor(readonly originalCause: Cause<E>, readonly _tag: string) {
    const limit = Error.stackTraceLimit
    Error.stackTraceLimit = 0
    super()
    Error.stackTraceLimit = limit
    const ff = makeFiberFailure(originalCause)
    this.name = ff.name
    this.message = ff.message
    if (ff.stack) {
      this.stack = ff.stack
    }
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

/** @tsplus type OptimisticConcurrencyException */
export class OptimisticConcurrencyException extends Data.TaggedError("OptimisticConcurrencyException")<
  { type: string; id: string; current?: string | undefined; found?: string | undefined; message: string }
> {
  constructor(
    args: {
      readonly type: string
      readonly id: string
      readonly current?: string | undefined
      readonly found?: string | undefined
    }
  ) {
    super({ ...args, message: `Existing ${args.type} ${args.id} record changed` })
  }
}
