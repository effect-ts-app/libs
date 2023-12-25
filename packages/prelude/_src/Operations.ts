import { Schema2 } from "./index.js"

export type OperationId = StringId
export const OperationId = StringId

@useClassFeaturesForSchema
export class OperationProgress extends ExtendedClass<
  OperationProgress.From,
  OperationProgress
>()({
  completed: PositiveInt,
  total: PositiveInt
}) {}

@useClassFeaturesForSchema
export class Success extends ExtendedTaggedClass<Success.From, Success>()("Success", {
  message: NonEmptyString2k.nullable.withDefault()
}) {}

@useClassFeaturesForSchema
export class Failure extends ExtendedTaggedClass<Failure.From, Failure>()("Failure", {
  message: NonEmptyString2k.nullable.withDefault()
}) {}

export const OperationResult = Schema2.union(Success, Failure)
export type OperationResult = Schema.To<typeof OperationResult>

@useClassFeaturesForSchema
export class Operation extends ExtendedClass<Operation.From, Operation>()({
  id: OperationId,
  progress: OperationProgress.optional(),
  result: OperationResult.optional(),
  createdAt: Schema2.Date.withDefault(),
  updatedAt: Schema2.Date.nullable.withDefault()
}) {}

// codegen:start {preset: model}
//
/* eslint-disable */
export namespace OperationProgress {
  /**
   * @tsplus type OperationProgress.From
   * @tsplus companion OperationProgress.From/Ops
   */
  export class From extends FromClass<typeof OperationProgress>() {}
}
export namespace Success {
  /**
   * @tsplus type Success.From
   * @tsplus companion Success.From/Ops
   */
  export class From extends FromClass<typeof Success>() {}
}
export namespace Failure {
  /**
   * @tsplus type Failure.From
   * @tsplus companion Failure.From/Ops
   */
  export class From extends FromClass<typeof Failure>() {}
}
export namespace Operation {
  /**
   * @tsplus type Operation.From
   * @tsplus companion Operation.From/Ops
   */
  export class From extends FromClass<typeof Operation>() {}
}
/* eslint-enable */
//
// codegen:end
