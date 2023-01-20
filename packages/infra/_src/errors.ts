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
  readonly pretty: string
  constructor(readonly exitCause: Cause<E>, readonly _tag: string) {
    super(`An unexpected ${_tag} Exception occurred, see \`pretty\` for details.`)
    this.pretty = exitCause.pretty()
  }

  toJSON() {
    return {
      _tag: this._tag,
      message: this.message,
      pretty: this.pretty
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
