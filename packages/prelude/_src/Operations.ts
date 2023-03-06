import { optProp } from "./schema.js"

export type OperationId = StringId
export const OperationId = StringId

export class OperationProgress extends MNModel<
  OperationProgress,
  OperationProgress.ConstructorInput,
  OperationProgress.Encoded,
  OperationProgress.Props
>()({
  completed: prop(PositiveInt),
  total: prop(PositiveInt)
}) {}
/** @ignore @internal @deprecated */
export type OperationProgressConstructor = typeof OperationProgress

export class Success extends MNModel<Success, Success.ConstructorInput, Success.Encoded, Success.Props>()({
  _tag: prop(literal("Success")),
  message: defaultProp(nullable(LongString))
}) {}
/** @ignore @internal @deprecated */
export type SuccessConstructor = typeof Success

export class Failure extends MNModel<Failure, Failure.ConstructorInput, Failure.Encoded, Failure.Props>()({
  _tag: prop(literal("Failure")),
  message: defaultProp(nullable(LongString))
}) {}
/** @ignore @internal @deprecated */
export type FailureConstructor = typeof Failure

export const OperationResult = union({ Success, Failure })
export type OperationResult = ParsedShapeOfCustom<typeof OperationResult>

export class Operation extends MNModel<Operation, Operation.ConstructorInput, Operation.Encoded, Operation.Props>()({
  id: prop(OperationId),
  progress: optProp(OperationProgress),
  result: optProp(OperationResult),
  createdAt: defaultProp(date),
  updatedAt: defaultProp(nullable(date))
}) {}
/** @ignore @internal @deprecated */
export type OperationConstructor = typeof Operation

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
