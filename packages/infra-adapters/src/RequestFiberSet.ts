/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Tracer } from "@effect-app/core"
import { Context, Effect, Fiber, FiberSet, Option } from "@effect-app/core"

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
  const run = FiberSet.run(set)

  const register = <A, E, R>(self: Effect<A, E, R>) =>
    self.pipe(Effect.fork, Effect.tap(add), Effect.andThen(Fiber.join))

  const getRootParentSpan = Effect.gen(function*($) {
    let span: Tracer.AnySpan = yield* $(Effect.currentSpan)
    while (span._tag === "Span" && Option.isSome(span.parent)) {
      span = span.parent.value
    }
    return span
  })

  const setRootParentSpan = <R, XE, XA>(effect: Effect.Effect<XA, XE, R>) =>
    getRootParentSpan.pipe(Effect.andThen((span) => Effect.withParentSpan(effect, span)))

  return {
    join,
    waitUntilEmpty,
    run,
    add,
    addAll,
    register,
    setRootParentSpan
  }
})

/**
 * Whenever you fork a fiber for a Request, and you want to prevent dependent services to close prematurely on interruption,
 * like the ServiceBus Sender, you should register these fibers in this FiberSet.
 */
export class RequestFiberSet extends Context.TagMakeId("RequestFiberSet", make)<RequestFiberSet>() {
  static readonly Live = this.toLayerScoped()
  static readonly register = <A, E, R>(self: Effect<A, E, R>) => this.use((_) => _.register(self))
  static readonly run = <A, E, R>(self: Effect<A, E, R>) => this.use((_) => _.run(self))
}
