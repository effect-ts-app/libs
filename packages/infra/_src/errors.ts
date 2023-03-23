import * as CausePretty from "@effect/io/internal_effect_untraced/cause-pretty"

export class NotFoundError<T extends string = string> {
  public readonly _tag = "NotFoundError"
  public readonly message: string
  constructor(type: T, id: string) {
    this.message = `Didn't find ${type}#${id}`
  }
}

export class ValidationError {
  public readonly _tag = "ValidationError"
  constructor(public readonly errors: ReadonlyArray<unknown>) {}
}

export class NotLoggedInError {
  public readonly _tag = "NotLoggedInError"
}

export class UnauthorizedError {
  public readonly _tag = "UnauthorizedError"
}

/**
 * The user carries a valid Userprofile, but there is a problem with the login none the less.
 */
export class LoginError extends NotLoggedInError {
  constructor(readonly message: string) {
    super()
  }
}

export class InvalidStateError {
  public readonly _tag = "InvalidStateError"
  constructor(public readonly message: string) {}
}

export class CauseException<E> extends Error {
  constructor(readonly originalCause: Cause<E>, readonly _tag: string) {
    const limit = Error.stackTraceLimit
    Error.stackTraceLimit = 0
    super()
    Error.stackTraceLimit = limit
    const pretty = (CausePretty as any).prettyErrors(this.originalCause)
    if (pretty.length > 0) {
      this.name = pretty[0].message.split(":")[0]
      this.message = pretty[0].message.substring(this.name.length + 2)
      this.stack = `${this.name}: ${this.message}\n` + pretty[0].stack
    }
  }
  override toString() {
    return `[${this._tag}] ` + (CausePretty as any).pretty(this.originalCause)
  }
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return this.toString()
  }

  toJSON() {
    return {
      _tag: this._tag,
      message: this.message,
      pretty: this.toString()
      //      cause: (this.cause as {}).$$.inspect(undefined, 10)
    }
  }
}

export class OptimisticConcurrencyException {
  readonly _tag = "OptimisticConcurrencyException"
  readonly message: string
  constructor(readonly type: string, readonly id: string, readonly current?: string, readonly found?: string) {
    this.message = `Existing ${type} ${id} record changed`
  }
}
