/* eslint-disable @typescript-eslint/no-explicit-any */
import { Context, Effect, Fiber, FiberSet, Option } from "@effect-app/core"

const getRootSpan = Effect.gen(function*($) {
  let root = yield* $(Effect.currentParentSpan)
  while (root._tag === "Span" && Option.isSome(root.parent)) {
    root = Option.getOrNull(root.parent)!
  }

  return root
})

const make = Effect.gen(function*($) {
  const set = yield* $(FiberSet.make<any, any>())
  const add = (...fibers: Fiber.RuntimeFiber<any, any>[]) =>
    Effect.sync(() => fibers.forEach((_) => FiberSet.unsafeAdd(set, _)))
  const addAll = (fibers: readonly Fiber.RuntimeFiber<any, any>[]) =>
    Effect.sync(() => fibers.forEach((_) => FiberSet.unsafeAdd(set, _)))
  const join = FiberSet.size(set).pipe(
    Effect.andThen((count) => Effect.logDebug(`Joining ${count} current fibers on the RequestFiberSet`)),
    Effect.andThen(FiberSet.join(set))
  )
  const waitUntilEmpty = Effect.gen(function*($) {
    if ((yield* $(FiberSet.size(set))) > 0) {
      yield* $(Effect.logDebug("Waiting RequestFiberSet to be empty: " + (yield* $(FiberSet.size(set)))))
    }
    while ((yield* $(FiberSet.size(set))) > 0) yield* $(Effect.sleep("250 millis"))
  })

  const run = <R, XE, XA>(
    effect: Effect.Effect<XA, XE, R>
  ): Effect.Effect<Fiber.RuntimeFiber<XA, XE>, never, R> =>
    getRootSpan.pipe(Effect.orDie, Effect.andThen((span) => FiberSet.run(set, Effect.withParentSpan(effect, span))))

  const register = <A, E, R>(self: Effect<A, E, R>) =>
    getRootSpan.pipe(
      Effect.orDie,
      Effect.andThen((span) =>
        self.pipe(Effect.withParentSpan(span), Effect.fork, Effect.tap(add), Effect.andThen(Fiber.join))
      )
    )

  return {
    join,
    waitUntilEmpty,
    run,
    add,
    addAll,
    register
  }
})

/**
 * Whenever you fork a fiber for a Request to keep running after the request finishes, and you want to prevent dependent services to close prematurely on interruption,
 * like the ServiceBus Sender, you should register these fibers in this FiberSet.
 * Attaches to the root span as parent, so it outlives the request.
 */
export class RequestFiberSet extends Context.TagMakeId("RequestFiberSet", make)<RequestFiberSet>() {
  static readonly Live = this.toLayerScoped()
  static readonly register = <A, E, R>(self: Effect<A, E, R>) => this.use((_) => _.register(self))
  static readonly run = <A, E, R>(self: Effect<A, E, R>) => this.use((_) => _.run(self))
}
