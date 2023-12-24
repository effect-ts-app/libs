import { Schema2 } from "./index.js"
import type { ConstructorInputApi, FieldsClass, To } from "./schema.js"
import { ExtendedClass, FromClass, NonEmptyString2k, PositiveInt, union, useClassFeaturesForSchema } from "./schema.js"

export type OperationId = StringId
export const OperationId = StringId

@useClassFeaturesForSchema
export class OperationProgress extends ExtendedClass<
  OperationProgress,
  OperationProgress.ConstructorInput,
  OperationProgress.From,
  OperationProgress.Fields
>()({
  completed: PositiveInt,
  total: PositiveInt
}) {}

@useClassFeaturesForSchema
export class Success extends ExtendedClass<Success, Success.ConstructorInput, Success.From, Success.Fields>()({
  _tag: literal("Success"),
  message: NonEmptyString2k.nullable.withDefault
}) {}

@useClassFeaturesForSchema
export class Failure extends ExtendedClass<Failure, Failure.ConstructorInput, Failure.From, Failure.Fields>()({
  _tag: literal("Failure"),
  message: NonEmptyString2k.nullable.withDefault
}) {}

export const OperationResult = union({ Success, Failure })
export type OperationResult = To<typeof OperationResult>

@useClassFeaturesForSchema
export class Operation
  extends ExtendedClass<Operation, Operation.ConstructorInput, Operation.From, Operation.Fields>()({
    id: OperationId,
    progress: OperationProgress.optional,
    result: OperationResult.optional,
    createdAt: Schema2.Date.withDefault,
    updatedAt: Schema2.Date.nullable.withDefault
  })
{}

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
    extends ConstructorInputApi<typeof OperationProgress> {}
  export interface Fields extends FieldsClass<typeof OperationProgress> {}
}
export namespace Success {
  /**
   * @tsplus type Success.From
   * @tsplus companion Success.From/Ops
   */
  export class From extends FromClass<typeof Success>() {}
  export interface ConstructorInput
    extends ConstructorInputApi<typeof Success> {}
  export interface Fields extends FieldsClass<typeof Success> {}
}
export namespace Failure {
  /**
   * @tsplus type Failure.From
   * @tsplus companion Failure.From/Ops
   */
  export class From extends FromClass<typeof Failure>() {}
  export interface ConstructorInput
    extends ConstructorInputApi<typeof Failure> {}
  export interface Fields extends FieldsClass<typeof Failure> {}
}
export namespace Operation {
  /**
   * @tsplus type Operation.From
   * @tsplus companion Operation.From/Ops
   */
  export class From extends FromClass<typeof Operation>() {}
  export interface ConstructorInput
    extends ConstructorInputApi<typeof Operation> {}
  export interface Fields extends FieldsClass<typeof Operation> {}
}
/* eslint-enable */
//
// codegen:end
