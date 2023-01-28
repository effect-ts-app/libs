import type { Lookup } from "../../Lookup/definition.js"
import type { Cache } from "../definition.js"
import { makeWith } from "./makeWith.js"

/**
 * Constructs a new cache with the specified capacity, time to live, and
 * lookup function.
 *
 * @tsplus static effect/cache/Cache.Ops make
 */
export function make<Key, Environment, Error, Value>(
  capacity: number,
  timeToLive: Duration,
  lookup: Lookup<Key, Environment, Error, Value>,
  __tsplusTrace?: string
): Effect<Environment, never, Cache<Key, Error, Value>> {
  return makeWith(capacity, lookup, () => timeToLive)
}
