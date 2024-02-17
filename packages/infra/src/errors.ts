/* eslint-disable @typescript-eslint/ban-types */
import { makeFiberFailure } from "effect/Runtime"

export * from "effect-app/client/errors"

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
