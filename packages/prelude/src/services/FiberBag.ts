import { Effect, Fiber, FiberSet, Layer } from "@effect-app/core"
import { TagClassMakeId } from "../service.js"

import type {} from "effect/Scope"
import type {} from "effect/Context"

const make = Effect.gen(function*($) {
  const set = yield* $(FiberSet.make<never, never>())
  const join = Effect.sync(() => [...set]).pipe(
    Effect.tap((bag) => Effect.logDebug("[FiberBag] Joining " + bag.length + " fibers")),
    Effect.andThen(Fiber.joinAll)
  )
  const add = (...fibers: Fiber.RuntimeFiber<never, never>[]) =>
    Effect.sync(() => fibers.forEach((_) => FiberSet.unsafeAdd(set, _)))
  const addAll = (fibers: readonly Fiber.RuntimeFiber<never, never>[]) =>
    Effect.sync(() => fibers.forEach((_) => FiberSet.unsafeAdd(set, _)))

  const run = FiberSet.run(set)

  return {
    join,
    run,
    add,
    addAll
  }
})

/**
 * Whenever you fork long running fibers e.g via `Effect.forkScoped` or `Effect.forkDaemon`
 * you should register these long running fibers in a `FiberBag`, and join them at the end of your main program.
 * This way any errors will blow up the main program instead of fibers dying unknowingly.
 */
export class FiberBag extends TagClassMakeId("FiberBag", make)<FiberBag>() {
  static readonly Live = this.toLayerScoped()
  static readonly JoinLive = this.pipe(Effect.andThen((_) => _.join), Layer.effectDiscard, Layer.provide(this.Live))
  static override readonly run = <R>(self: Effect<never, never, R>) => this.pipe(Effect.andThen((_) => _.run(self)))
}
