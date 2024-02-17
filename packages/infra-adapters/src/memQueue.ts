import * as Q from "effect/Queue"

/**
 * @tsplus type MemQueue
 * @tsplus companion MemQueue.Ops
 */
export class MemQueue extends TagClassId<MemQueue, {
  getOrCreateQueue: (k: string) => Effect<Queue<string>>
}>()("effect-app/MemQueue") {}

/**
 * @tsplus static MemQueue.Ops Live
 */
export const LiveMemQueue = Effect
  .gen(function*($) {
    const store = yield* $(Effect.sync(() => new Map<string, Queue<string>>()))

    return new MemQueue({
      getOrCreateQueue: (k: string) =>
        Effect.gen(function*($) {
          const q = store.get(k)
          if (q) return q
          const newQ = yield* $(Q.unbounded<string>())
          store.set(k, newQ)
          return newQ
        })
    })
  })
  .toLayer(MemQueue)
