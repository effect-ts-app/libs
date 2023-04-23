import { LongString } from "./schema.js"

export type OperationId = StringId
export const OperationId = StringId

@useClassFeaturesForSchema
export class OperationProgress extends MNModel<
  OperationProgress,
  OperationProgress.ConstructorInput,
  OperationProgress.Encoded,
  OperationProgress.Props
>()({
  completed: PositiveInt,
  total: PositiveInt
}) {}

@useClassFeaturesForSchema
export class Success extends MNModel<Success, Success.ConstructorInput, Success.Encoded, Success.Props>()({
  _tag: literal("Success"),
  message: LongString.nullable.withDefault
}) {}

@useClassFeaturesForSchema
export class Failure extends MNModel<Failure, Failure.ConstructorInput, Failure.Encoded, Failure.Props>()({
  _tag: literal("Failure"),
  message: LongString.nullable.withDefault
}) {}

export const OperationResult = union({ Success, Failure })
export type OperationResult = ParsedShapeOfCustom<typeof OperationResult>

@useClassFeaturesForSchema
export class Operation extends MNModel<Operation, Operation.ConstructorInput, Operation.Encoded, Operation.Props>()({
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
   * @tsplus type OperationProgress.Encoded
   * @tsplus companion OperationProgress.Encoded/Ops
   */
  export class Encoded extends EncodedClass<typeof OperationProgress>() {}
  export interface ConstructorInput
    extends ConstructorInputFromApi<typeof OperationProgress> {}
  export interface Props extends GetProvidedProps<typeof OperationProgress> {}
}
export namespace Success {
  /**
   * @tsplus type Success.Encoded
   * @tsplus companion Success.Encoded/Ops
   */
  export class Encoded extends EncodedClass<typeof Success>() {}
  export interface ConstructorInput
    extends ConstructorInputFromApi<typeof Success> {}
  export interface Props extends GetProvidedProps<typeof Success> {}
}
export namespace Failure {
  /**
   * @tsplus type Failure.Encoded
   * @tsplus companion Failure.Encoded/Ops
   */
  export class Encoded extends EncodedClass<typeof Failure>() {}
  export interface ConstructorInput
    extends ConstructorInputFromApi<typeof Failure> {}
  export interface Props extends GetProvidedProps<typeof Failure> {}
}
export namespace Operation {
  /**
   * @tsplus type Operation.Encoded
   * @tsplus companion Operation.Encoded/Ops
   */
  export class Encoded extends EncodedClass<typeof Operation>() {}
  export interface ConstructorInput
    extends ConstructorInputFromApi<typeof Operation> {}
  export interface Props extends GetProvidedProps<typeof Operation> {}
}
/* eslint-enable */
//
// codegen:end
