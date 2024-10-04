import { Context, Effect, Fiber, FiberSet, Layer } from "@effect-app/core"

import type {} from "effect/Scope"
import type {} from "effect/Context"
import { PreludeLogger } from "src/logger.js"

const make = Effect.gen(function*() {
  const set = yield* FiberSet.make<unknown, never>()
  const add = (...fibers: Fiber.RuntimeFiber<never, never>[]) =>
    Effect.sync(() => fibers.forEach((_) => FiberSet.unsafeAdd(set, _)))
  const addAll = (fibers: readonly Fiber.RuntimeFiber<never, never>[]) =>
    Effect.sync(() => fibers.forEach((_) => FiberSet.unsafeAdd(set, _)))
  const join = FiberSet.size(set).pipe(
    Effect.andThen((count) => PreludeLogger.logDebug(`Joining ${count} current fibers on the MainFiberSet`)),
    Effect.andThen(FiberSet.join(set))
  )
  const run = FiberSet.run(set)

  // const waitUntilEmpty = Effect.gen(function*() {
  //   const currentSize = yield* FiberSet.size(set)
  //   if (currentSize === 0) {
  //     return
  //   }
  //   yield* PreludeLogger.logInfo("Waiting MainFiberSet to be empty: " + currentSize)
  //   while ((yield* FiberSet.size(set)) > 0) yield* Effect.sleep("250 millis")
  //   yield* PreludeLogger.logDebug("MainFiberSet is empty")
  // })

  // TODO: loop and interrupt all fibers in the set continuously?
  const interrupt = Fiber.interruptAll(set)

  return {
    interrupt,
    join,
    run,
    add,
    addAll
  }
})

/**
 * Whenever you fork long running (e.g worker) fibers via e.g `Effect.forkScoped` or `Effect.forkDaemon`
 * you should register these long running fibers in a FiberSet, and join them at the end of your main program.
 * This way any errors will blow up the main program instead of fibers dying unknowingly.
 */
export class MainFiberSet extends Context.TagMakeId("MainFiberSet", make)<MainFiberSet>() {
  static readonly Live = this.toLayerScoped()
  static readonly JoinLive = this.pipe(Effect.andThen((_) => _.join), Layer.effectDiscard, Layer.provide(this.Live))
  static readonly run = <A, R>(self: Effect<A, never, R>) => this.use((_) => _.run(self))
}
