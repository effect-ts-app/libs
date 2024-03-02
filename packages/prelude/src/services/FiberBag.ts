import { Effect, Fiber, Layer, Ref } from "@effect-app/core"
import { TagClassMakeId } from "../service.js"

const make = Effect.gen(function*($) {
  const ref = yield* $(Ref.make<readonly Fiber.Fiber<void, never>[]>([]))
  return {
    join: ref.pipe(
      Ref.get,
      Effect.tap((bag) => Effect.logDebug("[FiberBag] Joining " + bag.length + " fibers")),
      Effect.andThen(Fiber.joinAll)
    ),
    add: (...fibers: Fiber.Fiber<void, never>[]) => ref.pipe(Ref.update((_) => [..._, ...fibers])),
    addAll: (fibers: readonly Fiber.Fiber<void, never>[]) => ref.pipe(Ref.update((_) => [..._, ...fibers]))
  }
})

/**
 * Whenever you fork long running fibers e.g via `Effect.forkScoped` or `Effect.forkDaemon`
 * you should register these long running fibers in a `FiberBag`, and join them at the end of your main program.
 * This way any errors will blow up the main program instead of fibers dying unknowingly.
 */
export class FiberBag extends TagClassMakeId("FiberBag", make)<FiberBag>() {
  static readonly Live = this.toLayer()
  static readonly JoinLive = this.pipe(Effect.andThen((_) => _.join), Layer.effectDiscard, Layer.provide(this.Live))
}
