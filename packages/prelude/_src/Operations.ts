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

//// codegen:start {preset: model}
////
/* eslint-disable */
export interface OperationProgress {
  readonly completed: PositiveInt
  readonly total: PositiveInt
}
export namespace OperationProgress {
  /**
   * @tsplus type OperationProgress.Encoded
   */
  export interface Encoded {
    readonly completed: number
    readonly total: number
  }
  export const Encoded: EncodedOps = { $: {} }
  /**
   * @tsplus type OperationProgress.Encoded/Aspects
   */
  export interface EncodedAspects {}
  /**
   * @tsplus type OperationProgress.Encoded/Ops
   */
  export interface EncodedOps { $: EncodedAspects }
  export interface ConstructorInput
    extends ConstructorInputFromApi<typeof OperationProgress> {}
  export interface Props extends GetProvidedProps<typeof OperationProgress> {}
}
export interface Success {
  readonly _tag: "Success"
  readonly message: LongString | null
}
export namespace Success {
  /**
   * @tsplus type Success.Encoded
   */
  export interface Encoded {
    readonly _tag: "Success"
    readonly message: string | null
  }
  export const Encoded: EncodedOps = { $: {} }
  /**
   * @tsplus type Success.Encoded/Aspects
   */
  export interface EncodedAspects {}
  /**
   * @tsplus type Success.Encoded/Ops
   */
  export interface EncodedOps { $: EncodedAspects }
  export interface ConstructorInput
    extends ConstructorInputFromApi<typeof Success> {}
  export interface Props extends GetProvidedProps<typeof Success> {}
}
export interface Failure {
  readonly _tag: "Failure"
  readonly message: LongString | null
}
export namespace Failure {
  /**
   * @tsplus type Failure.Encoded
   */
  export interface Encoded {
    readonly _tag: "Failure"
    readonly message: string | null
  }
  export const Encoded: EncodedOps = { $: {} }
  /**
   * @tsplus type Failure.Encoded/Aspects
   */
  export interface EncodedAspects {}
  /**
   * @tsplus type Failure.Encoded/Ops
   */
  export interface EncodedOps { $: EncodedAspects }
  export interface ConstructorInput
    extends ConstructorInputFromApi<typeof Failure> {}
  export interface Props extends GetProvidedProps<typeof Failure> {}
}
export interface Operation {
  readonly createdAt: Date
  readonly id: StringId
  readonly progress?: OperationProgress | undefined
  readonly result?: Failure | Success | undefined
  readonly updatedAt: Date | null
}
export namespace Operation {
  /**
   * @tsplus type Operation.Encoded
   */
  export interface Encoded {
    readonly createdAt: string
    readonly id: string
    readonly progress?: OperationProgress.Encoded | undefined
    readonly result?: Failure.Encoded | Success.Encoded | undefined
    readonly updatedAt: string | null
  }
  export const Encoded: EncodedOps = { $: {} }
  /**
   * @tsplus type Operation.Encoded/Aspects
   */
  export interface EncodedAspects {}
  /**
   * @tsplus type Operation.Encoded/Ops
   */
  export interface EncodedOps { $: EncodedAspects }
  export interface ConstructorInput
    extends ConstructorInputFromApi<typeof Operation> {}
  export interface Props extends GetProvidedProps<typeof Operation> {}
}
/* eslint-enable */
//
// codegen:end
//
