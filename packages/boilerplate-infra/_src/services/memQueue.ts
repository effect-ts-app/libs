import { Queue as Q } from "@effect/core/io/Queue"

export interface MemQueue {
  getOrCreateQueue: (k: string) => Effect<never, never, Queue<string>>
}

/**
 * @tsplus type MemQueue.Ops
 */

export interface MemQueueOps extends Tag<MemQueue> {}
export const MemQueue: MemQueueOps = Tag<MemQueue>()

/**
 * @tsplus static MemQueue.Ops Live
 */
export const LiveMemQueue = Layer.fromEffect(MemQueue)(
  Effect.gen(function*($) {
    const store = yield* $(Effect(new Map<string, Queue<string>>()))

    return {
      getOrCreateQueue: (k: string) =>
        Effect.gen(function*($) {
          const q = store.get(k)
          if (q) return q
          const newQ = yield* $(Q.unbounded<string>())
          store.set(k, newQ)
          return newQ
        })
    }
  })
)
