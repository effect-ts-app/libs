import type { CacheStats } from "../CacheStats.js"
import type { EntryStats } from "../EntryStats.js"

export const CacheURI = Symbol.for("@effect/cache/Cache")
export type CacheURI = typeof CacheURI

/**
 * A `Cache` is defined in terms of a lookup function that, given a key of
 * type `Key`, can either fail with an error of type `Error` or succeed with a
 * value of type `Value`. Getting a value from the cache will either return
 * the previous result of the lookup function if it is available or else
 * compute a new result with the lookup function, put it in the cache, and
 * return it.
 *
 * A cache also has a specified capacity and time to live. When the cache is
 * at capacity the least recently accessed values in the cache will be
 * removed to make room for new values. Getting a value with a life older than
 * the specified time to live will result in a new value being computed with
 * the lookup function and returned when available.
 *
 * The cache is safe for concurrent access. If multiple fibers attempt to get
 * the same key the lookup function will only be computed once and the result
 * will be returned to all fibers.
 *
 * @tsplus type effect/cache/Cache
 */
export interface Cache<Key, Error, Value> {
  readonly [CacheURI]: {
    readonly _Key: (_: Key) => void
    readonly _Error: (_: never) => Error
    readonly _Value: (_: never) => Value
  }

  /**
   * Returns the approximate number of values in the cache.
   */
  readonly size: Effect<never, never, number>

  /**
   * Returns an approximation of the entries in the cache.
   */
  readonly entries: Effect<never, never, Chunk<readonly [Key, Value]>>

  /**
   * Returns an approximation of the values in the cache.
   */
  readonly values: Effect<never, never, Chunk<Value>>

  /**
   * Returns statistics for this cache.
   */
  readonly cacheStats: Effect<never, never, CacheStats>

  /**
   * Returns statistics for the specified entry, if it exists.
   */
  readonly entryStats: (key: Key) => Effect<never, never, Option<EntryStats>>

  /**
   * Retrieves the value associated with the specified key if it exists.
   * Otherwise computes the value with the lookup function, puts it in the
   * cache, and returns it.
   */
  readonly get: (key: Key) => Effect<never, Error, Value>

  /**
   * Associates the specified value to the specified key in the cache.
   */
  readonly set: (key: Key, value: Value) => Effect<never, never, void>

  /**
   * Returns whether a value associated with the specified key exists in the
   * cache.
   */
  readonly contains: (key: Key) => Effect<never, never, boolean>

  /**
   * Computes the value associated with the specified key, with the lookup
   * function, and puts it in the cache. The difference between this and
   * `get` method is that `refresh` triggers (re)computation of the value
   * without invalidating it in the cache, so any request to the associated
   * key can still be served while the value is being re-computed/retrieved
   * by the lookup function. Additionally, `refresh` always triggers the
   * lookup function, disregarding the last `Error`.
   */
  readonly refresh: (key: Key) => Effect<never, Error, void>

  /**
   * Invalidates the value associated with the specified key.
   */
  readonly invalidate: (key: Key) => Effect<never, never, void>

  /**
   * Invalidates all values in the cache.
   */
  readonly invalidateAll: Effect<never, never, void>
}

/**
 * @tsplus type effect/cache/Cache.Ops
 */
export interface CacheOps {
  readonly $: CacheAspects
}
export const Cache: CacheOps = {
  $: {}
}

/**
 * @tsplus type effect/cache/Cache.Aspects
 */
export interface CacheAspects {}
