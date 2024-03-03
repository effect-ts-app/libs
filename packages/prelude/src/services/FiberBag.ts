import { Effect, Fiber, Layer, Ref } from "@effect-app/core"
import { TagClassMakeId } from "../service.js"

const make = Effect.gen(function*($) {
  const ref = yield* $(Ref.make<readonly Fiber.Fiber<void, never>[]>([]))
  const join = ref.pipe(
    Ref.get,
    Effect.tap((bag) => Effect.logDebug("[FiberBag] Joining " + bag.length + " fibers")),
    Effect.andThen(Fiber.joinAll)
  )
  const add = (...fibers: Fiber.Fiber<void, never>[]) => ref.pipe(Ref.update((_) => [..._, ...fibers]))
  const addAll = (fibers: readonly Fiber.Fiber<void, never>[]) => ref.pipe(Ref.update((_) => [..._, ...fibers]))

  const forkDaemon = <R>(effect: Effect<never, never, R>) => effect.pipe(Effect.forkDaemon, Effect.andThen(add))
  const forkScoped = <R>(effect: Effect<never, never, R>) => effect.pipe(Effect.forkScoped, Effect.andThen(add))

  return {
    join,
    forkDaemon,
    forkScoped,
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
  static readonly Live = this.toLayer()
  static readonly JoinLive = this.pipe(Effect.andThen((_) => _.join), Layer.effectDiscard, Layer.provide(this.Live))

  static override readonly forkScoped = <R>(effect: Effect<never, never, R>) =>
    Effect.andThen(this, (_) => _.forkScoped(effect))
  static override readonly forkDaemon = <R>(effect: Effect<never, never, R>) =>
    Effect.andThen(this, (_) => _.forkDaemon(effect))
}
