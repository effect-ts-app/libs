import type { Option } from "effect-app"
import { Effect } from "effect-app"
import type { Operation, OperationId, OperationProgress } from "effect-app/Operations"
import { TagClassId } from "effect-app/service"
import * as Scope from "effect/Scope"
import { forkDaemonReportRequestUnexpected } from "../../api/reportError.js"

/**
 * @tsplus type Operations
 * @tsplus companion Operations.Ops
 */
export class Operations extends TagClassId("effect-app/Operations")<Operations, {
  register: Effect<OperationId, never, Scope.Scope>
  update: (id: OperationId, progress: OperationProgress) => Effect<void>
  find: (id: OperationId) => Effect<Option<Operation>>
  cleanup: Effect<void>
}>() {
  static readonly find = Effect.serviceFunctions(this).find
  static readonly update = Effect.serviceFunctions(this).update
  static readonly register = Effect.serviceConstants(this).register
  static readonly cleanup = Effect.serviceConstants(this).cleanup
}

/**
 * @tsplus getter effect/io/Effect forkOperation
 */
export function forkOperation<R, E, A>(self: Effect<A, E, R>) {
  return Effect.flatMap(Operations, (Operations) =>
    Effect.flatMap(
      Scope.make(),
      (scope) =>
        Operations
          .register
          .pipe(
            Scope.extend(scope),
            Effect
              .tap(() => forkDaemonReportRequestUnexpected(Scope.use(self, scope)))
          )
    ))
}

/**
 * @tsplus getter function forkOperation
 */
export function forkOperationFunction<R, E, A, Inp>(fnc: (inp: Inp) => Effect<A, E, R>) {
  return (inp: Inp) => fnc(inp).pipe(forkOperation)
}

/**
 * @tsplus static effect/io/Effect.Ops forkOperation
 */
export function forkOperation2<R, E, A>(self: (opId: OperationId) => Effect<A, E, R>) {
  return Effect.flatMap(Operations, (Operations) =>
    Effect.flatMap(
      Scope.make(),
      (scope) =>
        Operations
          .register
          .pipe(
            Scope.extend(scope),
            Effect
              .tap((id) => forkDaemonReportRequestUnexpected(Scope.use(self(id), scope)))
          )
    ))
}

/**
 * @tsplus static effect/io/Effect.Ops forkOperationWithEffect
 */
export function forkOperationWithEffect<R, R2, E, E2, A, A2>(
  self: (id: OperationId) => Effect<A, E, R>,
  fnc: (id: OperationId) => Effect<A2, E2, R2>
) {
  return Effect.flatMap(Operations, (Operations) =>
    Effect.flatMap(
      Scope
        .make(),
      (scope) =>
        Operations
          .register
          .pipe(
            Scope.extend(scope),
            Effect.tap((opId) => forkDaemonReportRequestUnexpected(Scope.use(self(opId), scope))),
            Effect.tap((opId) => Effect.interruptible(fnc(opId)).pipe(Effect.forkScoped, Scope.extend(scope)))
          )
    ))
}
