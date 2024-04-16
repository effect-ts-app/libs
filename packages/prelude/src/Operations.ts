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
  message: S.NullOr(S.NonEmptyString2k).withDefault
}) {}

export class Failure extends S.ExtendedTaggedClass<Failure, Failure.From>()("Failure", {
  message: S.NullOr(S.NonEmptyString2k).withDefault
}) {}

export const OperationResult = S.ExtendTaggedUnion(S.Union(Success, Failure))
export type OperationResult = S.Schema.Type<typeof OperationResult>

export class Operation extends S.ExtendedClass<Operation, Operation.From>()({
  id: OperationId,
  title: S.NonEmptyString2k,
  progress: S.optional(OperationProgress),
  result: S.optional(OperationResult),
  createdAt: S.Date.withDefault,
  updatedAt: S.NullOr(S.Date).withDefault
}) {}

// codegen:start {preset: model}
//
/* eslint-disable */
export namespace OperationProgress {
  export interface From extends S.Struct.Encoded<typeof OperationProgress["fields"]> {}
}
export namespace Success {
  export interface From extends S.Struct.Encoded<typeof Success["fields"]> {}
}
export namespace Failure {
  export interface From extends S.Struct.Encoded<typeof Failure["fields"]> {}
}
export namespace Operation {
  export interface From extends S.Struct.Encoded<typeof Operation["fields"]> {}
}
/* eslint-enable */
//
// codegen:end
