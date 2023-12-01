@useClassFeaturesForSchema
export class NotFoundError extends Class<NotFoundError>()({
  _tag: literal("NotFoundError"),
  message: string
}) {}

@useClassFeaturesForSchema
export class InvalidStateError extends Class<InvalidStateError>()({
  _tag: literal("InvalidStateError"),
  message: string
}) {}

@useClassFeaturesForSchema
export class ValidationError extends Class<ValidationError>()({
  _tag: literal("ValidationError"),
  errors: array(unknown) // meh
}) {}

@useClassFeaturesForSchema
export class NotLoggedInError extends Class<NotLoggedInError>()({
  _tag: literal("NotLoggedInError"),
  message: string.optional
}) {}

@useClassFeaturesForSchema
export class UnauthorizedError extends Class<UnauthorizedError>()({
  _tag: literal("UnauthorizedError"),
  message: string.optional
}) {}

@useClassFeaturesForSchema
export class OptimisticConcurrencyException extends Class<OptimisticConcurrencyException>()(
  {
    _tag: literal("OptimisticConcurrencyException")
  }
) {}

const MutationOnlyErrors = {
  InvalidStateError,
  OptimisticConcurrencyException
}

const GeneralErrors = {
  NotFoundError,
  NotLoggedInError,
  UnauthorizedError,
  ValidationError
}

export const SupportedErrors = union({
  ...MutationOnlyErrors,
  ...GeneralErrors
})
  .pipe(named("SupportedErrors"))
  .pipe(withDefaults)
export type SupportedErrors = To<typeof SupportedErrors>

// ideal?
// export const QueryErrors = union({ ...GeneralErrors })
//   .pipe(named("QueryErrors"))
//   .pipe(withDefaults)
// export type QueryErrors = To<typeof QueryErrors>
// export const MutationErrors = union({ ...GeneralErrors, ...GeneralErrors })
//   .pipe(named("MutationErrors"))
//   .pipe(withDefaults)

// export type MutationErrors = To<typeof MutationErrors>

export const MutationErrors = SupportedErrors
export const QueryErrors = SupportedErrors
export type MutationErrors = To<typeof MutationErrors>
export type QueryErrors = To<typeof QueryErrors>
