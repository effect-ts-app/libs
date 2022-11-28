import type { Cache as _Cache } from "@effect/cache/Cache"
import { make as _make } from "@effect/cache/Cache"
import type { CacheState } from "@effect/cache/Cache/_internal/CacheState"
import type { Lookup } from "@effect/cache/Lookup"

/**
 * @tsplus type ets/cache/Cache
 */
export interface Cache<Key, Error, Value> extends _Cache<Key, Error, Value> {}

/**
 * @tsplus type ets/cache/CacheOps
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CacheOps {}

export const Cache: CacheOps = {}

/**
 * @tsplus static ets/cache/CacheOps make
 */
export function make<Key, Environment, Error, Value>(
  capacity: number,
  duration: DUR,
  lookup: Lookup<Key, Environment, Error, Value>
) {
  return _make(capacity, duration, lookup) as Effect<Environment, never, Cache<Key, Error, Value>>
}

/**
 * @tsplus getter ets/cache/Cache results
 */
export function results<Key, Error, Value>(
  self: Cache<Key, Error, Value>
): Effect<never, never, Chunk<[Key, Exit<Error, Value>]>> {
  return Effect.sync(() => {
    const values: Array<[Key, Exit<Error, Value>]> = []
    for (const [key, value] of ((self as any).cacheState as CacheState<Key, Error, Value>).map) {
      if (value._tag === "Complete") {
        values.push([key, value.exit])
      }
    }
    return Chunk.from(values)
  })
}
