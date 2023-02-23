import type { Operation, OperationId, OperationProgress } from "@effect-app/prelude/Operations"

export const OperationsId = Symbol("OperationsId")
/**
 * @tsplus type Operations
 * @tsplus companion Operations.Ops
 */
export abstract class Operations extends ServiceTaggedClass<Tag<Operations>>()(OperationsId) {
  abstract register: Effect<Scope, never, OperationId>
  abstract update: (id: OperationId, progress: OperationProgress) => Effect<never, never, void>
  abstract find: (id: OperationId) => Effect<never, never, Option<Operation>>
  abstract cleanup: Effect<never, never, void>
}

/**
 * @tsplus getter effect/io/Effect forkOperation
 */
export function forkOperation<R, E, A>(self: Effect<R, E, A>) {
  return Debug.untraced(() =>
    Operations.accessWithEffect(
      Operations =>
        Scope.make()
          .flatMap(scope =>
            Operations.register.extend(scope)
              .tap(() => self.use(scope).forkDaemonReportRequestUnexpected)
          )
    )
  )
}

/**
 * @tsplus getter function forkOperation
 */
export function forkOperationFunction<R, E, A, Inp>(fnc: (inp: Inp) => Effect<R, E, A>) {
  return (inp: Inp) => Debug.untraced(() => fnc(inp).forkOperation)
}

/**
 * @tsplus static effect/io/Effect.Ops forkOperation
 */
export function forkOperation2<R, E, A>(self: (opId: OperationId) => Effect<R, E, A>) {
  return Debug.untraced(restore =>
    Operations.accessWithEffect(
      Operations =>
        Scope.make()
          .flatMap(scope =>
            Operations.register.extend(scope)
              .tap(id => restore(self)(id).use(scope).forkDaemonReportRequestUnexpected)
          )
    )
  )
}

/**
 * @tsplus static effect/io/Effect.Ops forkOperationWithEffect
 */
export function forkOperationWithEffect<R, R2, E, E2, A, A2>(
  self: (id: OperationId) => Effect<R, E, A>,
  fnc: (id: OperationId) => Effect<R2, E2, A2>
) {
  return Debug.untraced(restore =>
    Operations.accessWithEffect(
      Operations =>
        Scope.make()
          .flatMap(scope =>
            Operations.register.extend(scope)
              .tap(opId => restore(self)(opId).use(scope).forkDaemonReportRequestUnexpected)
              .tap(opId => restore(fnc)(opId).interruptible.forkScoped.extend(scope))
          )
    )
  )
}
