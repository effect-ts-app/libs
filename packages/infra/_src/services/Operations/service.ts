import type { Operation, OperationId, OperationProgress } from "@effect-app/prelude/Operations"
import * as Scope from "effect/Scope"

/**
 * @tsplus type Operations
 * @tsplus companion Operations.Ops
 */
export class Operations extends TagClass<Operations.Id, {
  register: Effect<Scope.Scope, never, OperationId>
  update: (id: OperationId, progress: OperationProgress) => Effect<never, never, void>
  find: (id: OperationId) => Effect<never, never, Option<Operation>>
  cleanup: Effect<never, never, void>
}, Operations>() {}
export namespace Operations {
  export interface Id {
    readonly _: unique symbol
  }
}

/**
 * @tsplus getter effect/io/Effect forkOperation
 */
export function forkOperation<R, E, A>(self: Effect<R, E, A>) {
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
export function forkOperationFunction<R, E, A, Inp>(fnc: (inp: Inp) => Effect<R, E, A>) {
  return (inp: Inp) => fnc(inp).forkOperation
}

/**
 * @tsplus static effect/io/Effect.Ops forkOperation
 */
export function forkOperation2<R, E, A>(self: (opId: OperationId) => Effect<R, E, A>) {
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
  self: (id: OperationId) => Effect<R, E, A>,
  fnc: (id: OperationId) => Effect<R2, E2, A2>
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
