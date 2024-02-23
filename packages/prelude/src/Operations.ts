import * as S from "./schema.js"

export type OperationId = StringId
export const OperationId = StringId

export class OperationProgress extends ExtendedClass<
  OperationProgress,
  OperationProgress.From
>()({
  completed: NonNegativeInt,
  total: NonNegativeInt
}) {}

export class Success extends ExtendedTaggedClass<Success, Success.From>()("Success", {
  message: nullable(NonEmptyString2k).withDefault
}) {}

export class Failure extends ExtendedTaggedClass<Failure, Failure.From>()("Failure", {
  message: nullable(NonEmptyString2k).withDefault
}) {}

const r = S.union(Success, Failure)
export const OperationResult = Object.assign(r, {
  is: {
    Success: (x: OperationResult): x is Success => x._tag === "Success",
    Failure: (x: OperationResult): x is Failure => x._tag === "Failure"
  }
})
export type OperationResult = Schema.To<typeof r>

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
