import { useClassFeaturesForSchema } from "@effect-app/schema"

@useClassFeaturesForSchema
export class NotFoundError extends TaggedClass<NotFoundError>()("NotFoundError", {
  message: string
}) {}

@useClassFeaturesForSchema
export class InvalidStateError extends TaggedClass<InvalidStateError>()("InvalidStateError", {
  message: string
}) {}

@useClassFeaturesForSchema
export class ValidationError extends TaggedClass<ValidationError>()("ValidationError", {
  errors: array(unknown) // meh
}) {}

@useClassFeaturesForSchema
export class NotLoggedInError extends TaggedClass<NotLoggedInError>()("NotLoggedInError", {
  message: string.optional()
}) {}

@useClassFeaturesForSchema
export class UnauthorizedError extends TaggedClass<UnauthorizedError>()("UnauthorizedError", {
  message: string.optional()
}) {}

@useClassFeaturesForSchema
export class OptimisticConcurrencyException extends TaggedClass<OptimisticConcurrencyException>()(
  "OptimisticConcurrencyException",
  {}
) {}

const MutationOnlyErrors = [
  InvalidStateError,
  OptimisticConcurrencyException
] as const

const GeneralErrors = [
  NotFoundError,
  NotLoggedInError,
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
