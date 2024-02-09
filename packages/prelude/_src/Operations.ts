import * as S from "./schema.js"

export type OperationId = StringId
export const OperationId = StringId

@useClassFeaturesForSchema
export class OperationProgress extends ExtendedClass<
  OperationProgress,
  OperationProgress.From
>()({
  completed: NonNegativeInt,
  total: NonNegativeInt
}) {}

@useClassFeaturesForSchema
export class Success extends ExtendedTaggedClass<Success, Success.From>()("Success", {
  message: nullable(NonEmptyString2k).withDefault
}) {}

@useClassFeaturesForSchema
export class Failure extends ExtendedTaggedClass<Failure, Failure.From>()("Failure", {
  message: nullable(NonEmptyString2k).withDefault
}) {}

export const OperationResult = S.union(Success, Failure)
export type OperationResult = Schema.To<typeof OperationResult>

@useClassFeaturesForSchema
export class Operation extends ExtendedClass<Operation, Operation.From>()({
  id: OperationId,
  progress: S.optional(OperationProgress),
  result: S.optional(OperationResult),
  createdAt: S.Date.withDefault,
  updatedAt: nullable(S.Date).withDefault
}) {}

// codegen:start {preset: model}
//
/* eslint-disable */
export namespace OperationProgress {
  /**
   * @tsplus type OperationProgress.From
   * @tsplus companion OperationProgress.From/Ops
   */
  export class From extends S.FromClass<typeof OperationProgress>() {}
}
export namespace Success {
  /**
   * @tsplus type Success.From
   * @tsplus companion Success.From/Ops
   */
  export class From extends S.FromClass<typeof Success>() {}
}
export namespace Failure {
  /**
   * @tsplus type Failure.From
   * @tsplus companion Failure.From/Ops
   */
  export class From extends S.FromClass<typeof Failure>() {}
}
export namespace Operation {
  /**
   * @tsplus type Operation.From
   * @tsplus companion Operation.From/Ops
   */
  export class From extends S.FromClass<typeof Operation>() {}
}
/* eslint-enable */
//
// codegen:end
