import { annotateLogscoped } from "@effect-app/core/Effect"
import { reportError } from "@effect-app/infra/errorReporter"
import { NonEmptyString2k } from "@effect-app/schema"
import { subHours } from "date-fns"
import { Cause, copy, Duration, Effect, Exit, Layer, Option, S, Schedule } from "effect-app"
import type { OperationProgress } from "effect-app/Operations"
import { Failure, Operation, OperationId, Success } from "effect-app/Operations"
import { Operations } from "./service.js"

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
  return Operations.of({
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
  })
})

const cleanupLoop = Operations
  .pipe(
    Effect.flatMap((_) => _.cleanup),
    Effect.exit,
    Effect
      .flatMap((_) => {
        if (Exit.isSuccess(_)) {
          return Effect.unit
        } else {
          return reportAppError(_.cause)
        }
      }),
    Effect.schedule(Schedule.fixed(Duration.minutes(1))),
    Effect.forkScoped
  )

/**
 * @tsplus static Operations.Ops Live
 */
export const Live = cleanupLoop
  .pipe(
    Layer.scopedDiscard,
    Layer.provideMerge(Layer.effect(Operations, make))
  )
