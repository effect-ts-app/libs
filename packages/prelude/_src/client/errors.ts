@useClassFeaturesForSchema
export class NotFoundError extends Model<NotFoundError>()({
  _tag: prop(literal("NotFoundError")),
  message: prop(string)
}) {}

@useClassFeaturesForSchema
export class InvalidStateError extends Model<InvalidStateError>()({
  _tag: prop(literal("InvalidStateError")),
  message: prop(string)
}) {}

@useClassFeaturesForSchema
export class ValidationError extends Model<ValidationError>()({
  _tag: prop(literal("ValidationError")),
  errors: prop(array(unknown)) // meh
}) {}

@useClassFeaturesForSchema
export class NotLoggedInError extends Model<NotLoggedInError>()({
  _tag: prop(literal("NotLoggedInError")),
  message: prop(string).optional
}) {}

@useClassFeaturesForSchema
export class UnauthorizedError extends Model<UnauthorizedError>()({
  _tag: prop(literal("UnauthorizedError")),
  message: prop(string).optional
}) {}

@useClassFeaturesForSchema
export class OptimisticConcurrencyException extends Model<OptimisticConcurrencyException>()(
  {
    _tag: prop(literal("OptimisticConcurrencyException"))
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
export type SupportedErrors = ParsedShapeOf<typeof SupportedErrors>

// ideal?
// export const QueryErrors = union({ ...GeneralErrors })
//   .pipe(named("QueryErrors"))
//   .pipe(withDefaults)
// export type QueryErrors = ParsedShapeOf<typeof QueryErrors>
// export const MutationErrors = union({ ...GeneralErrors, ...GeneralErrors })
//   .pipe(named("MutationErrors"))
//   .pipe(withDefaults)

// export type MutationErrors = ParsedShapeOf<typeof MutationErrors>

export const MutationErrors = SupportedErrors
export const QueryErrors = SupportedErrors
export type MutationErrors = ParsedShapeOf<typeof MutationErrors>
export type QueryErrors = ParsedShapeOf<typeof QueryErrors>
