import * as S from "./Schema.js"

export type OperationId = S.StringId
export const OperationId = S.StringId

export class OperationProgress extends S.ExtendedClass<
  OperationProgress,
  OperationProgress.From
>()({
  completed: S.NonNegativeInt,
  total: S.NonNegativeInt
}) {}

export class OperationSuccess
  extends S.ExtendedTaggedClass<OperationSuccess, OperationSuccess.From>()("OperationSuccess", {
    message: S.NullOr(S.NonEmptyString2k).withDefault
  })
{}

export class OperationFailure
  extends S.ExtendedTaggedClass<OperationFailure, OperationFailure.From>()("OperationFailure", {
    message: S.NullOr(S.NonEmptyString2k).withDefault
  })
{}

export const OperationResult = S.TaggedUnion(OperationSuccess, OperationFailure)
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
export namespace OperationSuccess {
  export interface From extends S.Struct.Encoded<typeof OperationSuccess["fields"]> {}
}
export namespace OperationFailure {
  export interface From extends S.Struct.Encoded<typeof OperationFailure["fields"]> {}
}
export namespace Operation {
  export interface From extends S.Struct.Encoded<typeof Operation["fields"]> {}
}
/* eslint-enable */
//
// codegen:end
