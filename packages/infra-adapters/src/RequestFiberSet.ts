/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Tracer } from "@effect-app/core"
import { Context, Effect, Fiber, FiberSet, Option } from "@effect-app/core"
import { InfraLogger } from "./logger.js"

const make = Effect.gen(function*() {
  const set = yield* FiberSet.make<any, any>()
  const add = (...fibers: Fiber.RuntimeFiber<any, any>[]) =>
    Effect.sync(() => fibers.forEach((_) => FiberSet.unsafeAdd(set, _)))
  const addAll = (fibers: readonly Fiber.RuntimeFiber<any, any>[]) =>
    Effect.sync(() => fibers.forEach((_) => FiberSet.unsafeAdd(set, _)))
  const join = FiberSet.size(set).pipe(
    Effect.andThen((count) => InfraLogger.logInfo(`Joining ${count} current fibers on the RequestFiberSet`)),
    Effect.andThen(FiberSet.join(set))
  )
  const run = FiberSet.run(set)
  const register = <A, E, R>(self: Effect<A, E, R>) =>
    self.pipe(Effect.fork, Effect.tap(add), Effect.andThen(Fiber.join))

  // const waitUntilEmpty = Effect.gen(function*() {
  //   const currentSize = yield* FiberSet.size(set)
  //   if (currentSize === 0) {
  //     return
  //   }
  //   yield* Effect.logInfo("Waiting RequestFiberSet to be empty: " + currentSize)
  //   while ((yield* FiberSet.size(set)) > 0) yield* Effect.sleep("250 millis")
  //   yield* Effect.logDebug("RequestFiberSet is empty")
  // })
  // TODO: loop and interrupt all fibers in the set continuously?
  const interrupt = Fiber.interruptAll(set)

  return {
    interrupt,
    join,
    run,
    add,
    addAll,
    register
  }
})

const getRootParentSpan = Effect.gen(function*() {
  let span: Tracer.AnySpan = yield* Effect.currentSpan.pipe(Effect.orDie)
  while (span._tag === "Span" && Option.isSome(span.parent)) {
    span = span.parent.value
  }
  return span
})

export const setRootParentSpan = <A, E, R>(self: Effect<A, E, R>) =>
  getRootParentSpan.pipe(Effect.andThen((span) => Effect.withParentSpan(self, span)))

/**
 * Whenever you fork a fiber for a Request, and you want to prevent dependent services to close prematurely on interruption,
 * like the ServiceBus Sender, you should register these fibers in this FiberSet.
 */
export class RequestFiberSet extends Context.TagMakeId("RequestFiberSet", make)<RequestFiberSet>() {
  static readonly Live = this.toLayerScoped()
  static readonly register = <A, E, R>(self: Effect<A, E, R>) => this.use((_) => _.register(self))
  static readonly run = <A, E, R>(self: Effect<A, E, R>) => this.use((_) => _.run(self))
}
