import type { Operation, OperationId, OperationProgress } from "@effect-app/prelude/Operations"
import * as Scope from "effect/Scope"

export interface OperationsId {
  readonly _: unique symbol
}

/**
 * @tsplus type Operations
 * @tsplus companion Operations.Ops
 */
export abstract class Operations extends TagClass<OperationsId, Operations>() {
  abstract register: Effect<Scope.Scope, never, OperationId>
  abstract update: (id: OperationId, progress: OperationProgress) => Effect<never, never, void>
  abstract find: (id: OperationId) => Effect<never, never, Option<Operation>>
  abstract cleanup: Effect<never, never, void>
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
