import { TaggedError } from "@effect-app/schema"

/** @tsplus type NotFoundError */
@useClassFeaturesForSchema
// eslint-disable-next-line unused-imports/no-unused-vars
// @ts-expect-error type not used
export class NotFoundError<ItemType> extends TaggedError<NotFoundError<any>>()("NotFoundError", {
  type: string,
  id: unknown
}) {
  override get message() {
    return `Didn't find ${this.type}#${JSON.stringify(this.id)}`
  }
}

/** @tsplus type InvalidStateError */
@useClassFeaturesForSchema
export class InvalidStateError extends TaggedError<InvalidStateError>()("InvalidStateError", {
  message: string
}) {
  constructor(messageOrObject: string | { message: string }, disableValidation = false) {
    super(typeof messageOrObject === "object" ? messageOrObject : { message: messageOrObject }, disableValidation)
  }
}

/** @tsplus type ValidationError */
@useClassFeaturesForSchema
export class ValidationError extends TaggedError<ValidationError>()("ValidationError", {
  errors: array(unknown) // meh
}) {
  override get message() {
    return `Validation failed: ${this.errors.map((e) => JSON.stringify(e)).join(", ")}`
  }
}

/** @tsplus type NotLoggedInError */
@useClassFeaturesForSchema
export class NotLoggedInError extends TaggedError<NotLoggedInError>()("NotLoggedInError", {
  message: string.optional()
}) {
  constructor(messageOrObject?: string | { message?: string }, disableValidation = false) {
    super(typeof messageOrObject === "object" ? messageOrObject : { message: messageOrObject }, disableValidation)
  }
}

/**
 * The user carries a valid Userprofile, but there is a problem with the login none the less.
 */
/** @tsplus type LoginError */
@useClassFeaturesForSchema
export class LoginError extends TaggedError<LoginError>()("NotLoggedInError", {
  message: string.optional()
}) {
  constructor(messageOrObject?: string | { message?: string }, disableValidation = false) {
    super(typeof messageOrObject === "object" ? messageOrObject : { message: messageOrObject }, disableValidation)
  }
}

/** @tsplus type UnauthorizedError */
@useClassFeaturesForSchema
export class UnauthorizedError extends TaggedError<UnauthorizedError>()("UnauthorizedError", {
  message: string.optional()
}) {
  constructor(messageOrObject?: string | { message?: string }, disableValidation = false) {
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
@useClassFeaturesForSchema
export class OptimisticConcurrencyException extends TaggedError<OptimisticConcurrencyException>()(
  "OptimisticConcurrencyException",
  { message: string }
) {
  readonly details?: OptimisticConcurrencyDetails
  constructor(
    args: OptimisticConcurrencyDetails | { message: string },
    disableValidation = false
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

export const SupportedErrors = union(
  ...MutationOnlyErrors,
  ...GeneralErrors
)
// .pipe(named("SupportedErrors"))
// .pipe(withDefaults)
export type SupportedErrors = Schema.To<typeof SupportedErrors>

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
export type MutationErrors = Schema.To<typeof MutationErrors>
export type QueryErrors = Schema.To<typeof QueryErrors>
