import type { StringId } from "@effect-app/schema"
import { Cause, Context, copy, Duration, Effect, Exit, Layer, Option, S, Schedule } from "effect-app"
import type { OperationProgress } from "effect-app/Operations"
import * as Scope from "effect/Scope"
import { forkDaemonReportRequestUnexpected } from "../api/reportError.js"

import { annotateLogscoped } from "@effect-app/core/Effect"
import { reportError } from "@effect-app/infra/errorReporter"
import { NonEmptyString2k } from "@effect-app/schema"
import { subHours } from "date-fns"
import { Failure, Operation, OperationId, Success } from "effect-app/Operations"
import { FiberBag } from "effect-app/services/FiberBag"

const reportAppError = reportError("Operations.Cleanup")

const make = Effect.sync(() => {
  const ops = new Map<OperationId, Operation>()
  const makeOp = Effect.sync(() => OperationId.make())

  const cleanup = Effect
    .sync(() => {
      const before = subHours(new Date(), 1)
      ;[...ops
        .entries()]
        .forEach(([id, op]) => {
          const lastChanged = Option.fromNullable(op.updatedAt).pipe(Option.getOrElse(() => op.createdAt))
          if (lastChanged < before) {
            ops.delete(id)
          }
        })
    })
    .pipe(Effect.withSpan("Operations.cleanup"))

  function addOp(id: OperationId) {
    return Effect.sync(() => {
      ops.set(id, new Operation({ id }))
    })
  }
  function findOp(id: OperationId) {
    return Effect.sync(() => Option.fromNullable(ops.get(id)))
  }
  function finishOp(id: OperationId, exit: Exit<unknown, unknown>) {
    return Effect.flatMap(findOp(id), (_) =>
      Effect.sync(() => {
        if (Option.isNone(_)) {
          throw new Error("Not found")
        }
        ops.set(
          id,
          copy(_.value, {
            updatedAt: new Date(),
            result: Exit.isSuccess(exit)
              ? new Success()
              : new Failure({
                message: Cause.isInterrupted(exit.cause)
                  ? NonEmptyString2k("Interrupted")
                  : Cause.isDie(exit.cause)
                  ? NonEmptyString2k("Unknown error")
                  : Cause
                    .failureOption(exit.cause)
                    .pipe(
                      Option.flatMap((_) =>
                        typeof _ === "object" && _ !== null && "message" in _ && S.is(NonEmptyString2k)(_.message)
                          ? Option.some(_.message)
                          : Option.none()
                      ),
                      Option.getOrNull
                    )
              })
          })
        )
      }))
  }
  function update(id: OperationId, progress: OperationProgress) {
    return Effect.flatMap(findOp(id), (_) =>
      Effect.sync(() => {
        if (Option.isNone(_)) {
          throw new Error("Not found")
        }
        ops.set(id, copy(_.value, { updatedAt: new Date(), progress }))
      }))
  }
  return {
    cleanup,
    register: Effect.tap(
      makeOp,
      (id) =>
        Effect.andThen(
          annotateLogscoped("operationId", id),
          Effect.acquireRelease(addOp(id), (_, exit) => finishOp(id, exit))
        )
    ),

    find: findOp,
    update
  }
})

export class Operations extends Context.TagMakeId("effect-app/Operations", make)<Operations>() {
  private static readonly CleanupLive = this
    .use((_) =>
      _.cleanup.pipe(
        Effect.exit,
        Effect
          .flatMap((_) => {
            if (Exit.isSuccess(_)) {
              return Effect.unit
            } else {
              return reportAppError(_.cause)
            }
          }),
        Effect.schedule(Schedule.fixed(Duration.minutes(20))),
        Effect.map((_) => _ as never),
        FiberBag.run
      )
    )
    .pipe(Layer.effectDiscard, Layer.provide(FiberBag.Live))

  static readonly Live = this.CleanupLive.pipe(Layer.provideMerge(this.toLayer()))
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
): Effect<StringId, never, Operations | Exclude<R, Scope.Scope> | Exclude<R2, Scope.Scope>> {
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
