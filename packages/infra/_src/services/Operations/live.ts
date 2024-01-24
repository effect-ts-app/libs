import { reportError } from "@effect-app/infra/errorReporter"
import type { OperationProgress } from "@effect-app/prelude/Operations"
import { Failure, Operation, OperationId, Success } from "@effect-app/prelude/Operations"
import { Operations } from "./service.js"

const reportAppError = reportError("Operations.Cleanup")

const make = Effect.sync((): Operations => {
  const ops = new Map<OperationId, Operation>()
  const makeOp = Effect.sync(() => OperationId.make())

  const cleanup = Effect
    .sync(() => {
      const before = new Date().subHours(1)
      ops
        .entries()
        .toChunk
        .forEach(([id, op]) => {
          const lastChanged = Option.fromNullable(op.updatedAt).getOrElse(() => op.createdAt)
          if (lastChanged < before) {
            ops.delete(id)
          }
        })
    })
    .withSpan("Operations.cleanup")

  function addOp(id: OperationId) {
    return Effect.sync(() => {
      ops.set(id, new Operation({ id }))
    })
  }
  function findOp(id: OperationId) {
    return Effect.sync(() => Option.fromNullable(ops.get(id)))
  }
  function finishOp(id: OperationId, exit: Exit<unknown, unknown>) {
    return findOp(id).flatMap((_) =>
      Effect.sync(() => {
        if (_.isNone()) {
          throw new Error("Not found")
        }
        ops.set(id, {
          ..._.value,
          updatedAt: new Date(),
          result: exit.isSuccess()
            ? new Success()
            : new Failure({
              message: exit.cause.isInterrupted()
                ? NonEmptyString2k("Interrupted")
                : exit.cause.isDie()
                ? NonEmptyString2k("Unknown error")
                : exit
                  .cause
                  .failureOption
                  .flatMap((_) =>
                    typeof _ === "object" && _ !== null && "message" in _ && NonEmptyString2k.is(_.message)
                      ? Option.some(_.message)
                      : Option.none
                  )
                  .value ?? null
            })
        })
      })
    )
  }
  function update(id: OperationId, progress: OperationProgress) {
    return findOp(id).flatMap((_) =>
      Effect.sync(() => {
        if (_.isNone()) {
          throw new Error("Not found")
        }
        ops.set(id, { ..._.value, updatedAt: new Date(), progress })
      })
    )
  }
  return {
    cleanup,
    register: makeOp
      .tap((id) =>
        Effect.annotateLogscoped("operationId", id)
          > addOp(id).acquireRelease(
            (_, exit) => finishOp(id, exit)
          )
      ),

    find: findOp,
    update
  }
})

const cleanupLoop = Operations
  .flatMap((_) => _.cleanup)
  .exit
  .flatMap((_) => {
    if (_.isSuccess()) {
      return Effect.unit
    } else {
      return reportAppError(_.cause)
    }
  })
  .schedule(Schedule.fixed(Duration.minutes(1)))
  .forkScoped

/**
 * @tsplus static Operations.Ops Live
 */
export const Live = cleanupLoop
  .toLayerScopedDiscard
  .provideMerge(make.toLayer(Operations))
