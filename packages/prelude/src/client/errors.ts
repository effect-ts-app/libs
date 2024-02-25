import { TaggedError } from "effect-app/schema"
import { S } from "../lib.js"

/** @tsplus type NotFoundError */
// eslint-disable-next-line unused-imports/no-unused-vars
// @ts-expect-error type not used
export class NotFoundError<ItemType = string> extends TaggedError<NotFoundError<ItemType>>()("NotFoundError", {
  type: S.string,
  id: S.unknown
}) {
  override get message() {
    return `Didn't find ${this.type}#${JSON.stringify(this.id)}`
  }
}

/** @tsplus type InvalidStateError */
export class InvalidStateError extends TaggedError<InvalidStateError>()("InvalidStateError", {
  message: S.string
}) {
  constructor(messageOrObject: string | { message: string }, disableValidation?: boolean) {
    super(typeof messageOrObject === "object" ? messageOrObject : { message: messageOrObject }, disableValidation)
  }
}

/** @tsplus type ValidationError */
export class ValidationError extends TaggedError<ValidationError>()("ValidationError", {
  errors: S.array(S.unknown) // meh
}) {
  override get message() {
    return `Validation failed: ${this.errors.map((e) => JSON.stringify(e)).join(", ")}`
  }
}

/** @tsplus type NotLoggedInError */
export class NotLoggedInError extends TaggedError<NotLoggedInError>()("NotLoggedInError", {
  message: S.optional(S.string)
}) {
  constructor(messageOrObject?: string | { message?: string }, disableValidation?: boolean) {
    super(typeof messageOrObject === "object" ? messageOrObject : { message: messageOrObject }, disableValidation)
  }
}

/**
 * The user carries a valid Userprofile, but there is a problem with the login none the less.
 */
/** @tsplus type LoginError */
export class LoginError extends TaggedError<LoginError>()("NotLoggedInError", {
  message: S.optional(S.string)
}) {
  constructor(messageOrObject?: string | { message?: string }, disableValidation?: boolean) {
    super(typeof messageOrObject === "object" ? messageOrObject : { message: messageOrObject }, disableValidation)
  }
}

/** @tsplus type UnauthorizedError */
export class UnauthorizedError extends TaggedError<UnauthorizedError>()("UnauthorizedError", {
  message: S.optional(S.string)
}) {
  constructor(messageOrObject?: string | { message?: string }, disableValidation?: boolean) {
    super(typeof messageOrObject === "object" ? messageOrObject : { message: messageOrObject }, disableValidation)
  }
}

type OptimisticConcurrencyDetails = {
  readonly type: string
  readonly id: string
  readonly current?: string | undefined
  readonly found?: string | undefined
}

/** @tsplus type OptimisticConcurrencyException */
export class OptimisticConcurrencyException extends TaggedError<OptimisticConcurrencyException>()(
  "OptimisticConcurrencyException",
  { message: S.string }
) {
  readonly details?: OptimisticConcurrencyDetails
  constructor(
    args: OptimisticConcurrencyDetails | { message: string },
    disableValidation?: boolean
  ) {
    super("message" in args ? args : { message: `Existing ${args.type} ${args.id} record changed` }, disableValidation)
    if (!("message" in args)) {
      this.details = args
    }
  }
}

const MutationOnlyErrors = [
  InvalidStateError,
  OptimisticConcurrencyException
] as const

const GeneralErrors = [
  NotFoundError,
  NotLoggedInError,
  LoginError,
  UnauthorizedError,
  ValidationError
] as const

export const SupportedErrors = S.union(
  ...MutationOnlyErrors,
  ...GeneralErrors
)
// .pipe(named("SupportedErrors"))
// .pipe(withDefaults)
export type SupportedErrors = S.Schema.To<typeof SupportedErrors>

// ideal?
// export const QueryErrors = union({ ...GeneralErrors })
//   .pipe(named("QueryErrors"))
//   .pipe(withDefaults)
// export type QueryErrors = Schema.To<typeof QueryErrors>
// export const MutationErrors = union({ ...GeneralErrors, ...GeneralErrors })
//   .pipe(named("MutationErrors"))
//   .pipe(withDefaults)

// export type MutationErrors = Schema.To<typeof MutationErrors>

export const MutationErrors = SupportedErrors
export const QueryErrors = SupportedErrors
export type MutationErrors = S.Schema.To<typeof MutationErrors>
export type QueryErrors = S.Schema.To<typeof QueryErrors>
