import type { Operation, OperationId, OperationProgress } from "effect-app/Operations"
import * as Scope from "effect/Scope"

/**
 * @tsplus type Operations
 * @tsplus companion Operations.Ops
 */
export class Operations extends TagClass<Operations.Id, {
  register: Effect<OperationId, never, Scope.Scope>
  update: (id: OperationId, progress: OperationProgress) => Effect<void>
  find: (id: OperationId) => Effect<Option<Operation>>
  cleanup: Effect<void>
}, Operations>() {
  static readonly find = Effect.serviceFunctions(this).find
  static readonly update = Effect.serviceFunctions(this).update
  static readonly register = Effect.serviceConstants(this).register
  static readonly cleanup = Effect.serviceConstants(this).cleanup
}
export namespace Operations {
  export interface Id {
    readonly _: unique symbol
  }
}

/**
 * @tsplus getter effect/io/Effect forkOperation
 */
export function forkOperation<R, E, A>(self: Effect<A, E, R>) {
  return Operations.flatMap(
    (Operations) =>
      Scope
        .make()
        .flatMap((scope) =>
          Operations
            .register
            .extend(scope)
            .tap(() => self.use(scope).forkDaemonReportRequestUnexpected)
        )
  )
}

/**
 * @tsplus getter function forkOperation
 */
export function forkOperationFunction<R, E, A, Inp>(fnc: (inp: Inp) => Effect<A, E, R>) {
  return (inp: Inp) => fnc(inp).forkOperation
}

/**
 * @tsplus static effect/io/Effect.Ops forkOperation
 */
export function forkOperation2<R, E, A>(self: (opId: OperationId) => Effect<A, E, R>) {
  return Operations.flatMap(
    (Operations) =>
      Scope
        .make()
        .flatMap((scope) =>
          Operations
            .register
            .extend(scope)
            .tap((id) => self(id).use(scope).forkDaemonReportRequestUnexpected)
        )
  )
}

/**
 * @tsplus static effect/io/Effect.Ops forkOperationWithEffect
 */
export function forkOperationWithEffect<R, R2, E, E2, A, A2>(
  self: (id: OperationId) => Effect<A, E, R>,
  fnc: (id: OperationId) => Effect<A2, E2, R2>
) {
  return Operations.flatMap(
    (Operations) =>
      Scope
        .make()
        .flatMap((scope) =>
          Operations
            .register
            .extend(scope)
            .tap((opId) => self(opId).use(scope).forkDaemonReportRequestUnexpected)
            .tap((opId) => fnc(opId).interruptible.forkScoped.extend(scope))
        )
  )
}
