import * as S from "./schema.js"

export type OperationId = S.StringId
export const OperationId = S.StringId

export class OperationProgress extends S.ExtendedClass<
  OperationProgress,
  OperationProgress.From
>()({
  completed: S.NonNegativeInt,
  total: S.NonNegativeInt
}) {}

export class Success extends S.ExtendedTaggedClass<Success, Success.From>()("Success", {
  message: S.nullable(S.NonEmptyString2k).withDefault
}) {}

export class Failure extends S.ExtendedTaggedClass<Failure, Failure.From>()("Failure", {
  message: S.nullable(S.NonEmptyString2k).withDefault
}) {}

export const OperationResult = S.extendTaggedUnion(S.union(Success, Failure))
export type OperationResult = S.Schema.To<typeof OperationResult>

export class Operation extends S.ExtendedClass<Operation, Operation.From>()({
  id: OperationId,
  progress: S.optional(OperationProgress),
  result: S.optional(OperationResult),
  createdAt: S.Date.withDefault,
  updatedAt: S.nullable(S.Date).withDefault
}) {}

// codegen:start {preset: model}
//
/* eslint-disable */
export namespace OperationProgress {
  export class From extends S.FromClass<typeof OperationProgress>() {}
}
export namespace Success {
  export class From extends S.FromClass<typeof Success>() {}
}
export namespace Failure {
  export class From extends S.FromClass<typeof Failure>() {}
}
export namespace Operation {
  export class From extends S.FromClass<typeof Operation>() {}
}
/* eslint-enable */
//
// codegen:end
