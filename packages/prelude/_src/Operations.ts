import { LongString } from "./schema.js"

export type OperationId = StringId
export const OperationId = StringId

@useClassFeaturesForSchema
export class OperationProgress extends MNModel<
  OperationProgress,
  OperationProgress.ConstructorInput,
  OperationProgress.From,
  OperationProgress.Props
>()({
  completed: PositiveInt,
  total: PositiveInt
}) {}

@useClassFeaturesForSchema
export class Success extends MNModel<Success, Success.ConstructorInput, Success.From, Success.Props>()({
  _tag: literal("Success"),
  message: LongString.nullable.withDefault
}) {}

@useClassFeaturesForSchema
export class Failure extends MNModel<Failure, Failure.ConstructorInput, Failure.From, Failure.Props>()({
  _tag: literal("Failure"),
  message: LongString.nullable.withDefault
}) {}

export const OperationResult = union({ Success, Failure })
export type OperationResult = To<typeof OperationResult>

@useClassFeaturesForSchema
export class Operation extends MNModel<Operation, Operation.ConstructorInput, Operation.From, Operation.Props>()({
  id: OperationId,
  progress: OperationProgress.optional,
  result: OperationResult.optional,
  createdAt: date.withDefault,
  updatedAt: date.nullable.withDefault
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
  export interface ConstructorInput
    extends ConstructorInputFromApi<typeof OperationProgress> {}
  export interface Props extends GetProvidedProps<typeof OperationProgress> {}
}
export namespace Success {
  /**
   * @tsplus type Success.From
   * @tsplus companion Success.From/Ops
   */
  export class From extends FromClass<typeof Success>() {}
  export interface ConstructorInput
    extends ConstructorInputFromApi<typeof Success> {}
  export interface Props extends GetProvidedProps<typeof Success> {}
}
export namespace Failure {
  /**
   * @tsplus type Failure.From
   * @tsplus companion Failure.From/Ops
   */
  export class From extends FromClass<typeof Failure>() {}
  export interface ConstructorInput
    extends ConstructorInputFromApi<typeof Failure> {}
  export interface Props extends GetProvidedProps<typeof Failure> {}
}
export namespace Operation {
  /**
   * @tsplus type Operation.From
   * @tsplus companion Operation.From/Ops
   */
  export class From extends FromClass<typeof Operation>() {}
  export interface ConstructorInput
    extends ConstructorInputFromApi<typeof Operation> {}
  export interface Props extends GetProvidedProps<typeof Operation> {}
}
/* eslint-enable */
//
// codegen:end
