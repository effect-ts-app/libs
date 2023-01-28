import type { Lookup } from "../../Lookup/definition.js"
import { CacheInternal } from "../_internal/CacheInternal.js"
import type { Cache } from "../definition.js"

/**
 * Constructs a new cache with the specified capacity, time to live, and
 * lookup function, where the time to live can depend on the `Exit` value
 * returned by the lookup function.
 *
 * @tsplus static effect/cache/Cache.Ops makeWith
 */
export function makeWith<Key, Environment, Error, Value>(
  capacity: number,
  lookup: Lookup<Key, Environment, Error, Value>,
  timeToLive: (exit: Exit<Error, Value>) => Duration,
  __tsplusTrace?: string
): Effect<Environment, never, Cache<Key, Error, Value>> {
  return Effect.clockWith(clock =>
    Effect.context<Environment>().flatMap(environment =>
      Effect.fiberId().map(fiberId =>
        new CacheInternal(
          capacity,
          lookup,
          timeToLive,
          clock,
          environment,
          fiberId
        )
      )
    )
  )
}
