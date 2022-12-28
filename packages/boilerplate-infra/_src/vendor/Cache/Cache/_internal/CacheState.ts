import { KeySet } from "@effect/cache/Cache/_internal/KeySet"
import type { MapKey } from "@effect/cache/Cache/_internal/MapKey"
import type { MapValue } from "@effect/cache/Cache/_internal/MapValue"

/**
 * The `CacheState` represents the mutable state underlying the cache.
 *
 * @tsplus type effect/cache/Cache/CacheState
 */
export interface CacheState<Key, Error, Value> {
  map: MutableHashMap<Key, MapValue<Key, Error, Value>>
  keys: KeySet<Key>
  accesses: MutableQueue<MapKey<Key>>
  updating: AtomicBoolean
  hits: number
  misses: number
}

/**
 * @tsplus type effect/cache/Cache/CacheState.Ops
 */
export interface CacheStateOps {
  <Key, Error, Value>(
    map: MutableHashMap<Key, MapValue<Key, Error, Value>>,
    keys: KeySet<Key>,
    accesses: MutableQueue<MapKey<Key>>,
    updating: AtomicBoolean,
    hits: number,
    misses: number
  ): CacheState<Key, Error, Value>
}
export const CacheState: CacheStateOps = (map, keys, accesses, updating, hits, misses) => ({
  map,
  keys,
  accesses,
  updating,
  hits,
  misses
})

/**
 * Constructs an initial cache state.
 *
 * @tsplus static effect/cache/Cache/CacheState.Ops initial
 */
export function initial<Key, Error, Value>(): CacheState<Key, Error, Value> {
  return CacheState(
    MutableHashMap.empty(),
    new KeySet(),
    MutableQueue.unbounded(),
    new AtomicBoolean(false),
    0,
    0
  )
}
