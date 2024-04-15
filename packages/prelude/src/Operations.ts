import * as S from "@effect/Schema/Schema"
import * as S2 from "./schema.js"

export type OperationId = S2.StringId
export const OperationId = S2.StringId

export class OperationProgress extends S2.ExtendedClass<
  OperationProgress,
  OperationProgress.From
>()({
  completed: S2.NonNegativeInt,
  total: S2.NonNegativeInt
}) {}

export class Success extends S2.ExtendedTaggedClass<Success, Success.From>()("Success", {
  message: S2.NullOr(S2.NonEmptyString2k).withDefault
}) {}

export class Failure extends S2.ExtendedTaggedClass<Failure, Failure.From>()("Failure", {
  message: S2.NullOr(S2.NonEmptyString2k).withDefault
}) {}

export const OperationResult = S2.ExtendTaggedUnion(S.Union(Success, Failure))
export type OperationResult = S.Schema.Type<typeof OperationResult>

export class Operation extends S2.ExtendedClass<Operation, Operation.From>()({
  id: OperationId,
  title: S2.NonEmptyString2k,
  progress: S.optional(OperationProgress),
  result: S.optional(OperationResult),
  createdAt: S2.Date.withDefault,
  updatedAt: S2.NullOr(S.Date).withDefault
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
