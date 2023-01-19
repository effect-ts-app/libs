/**
 * A `CacheStats` represents a snapshot of statistics for the cache as of a
 * point in time.
 *
 * @tsplus type effect/cache/CacheStats
 */
export interface CacheStats {
  readonly hits: number
  readonly misses: number
  readonly size: number
}

/**
 * @tsplus type effect/cache/CacheStats.Ops
 */
export interface CacheStatsOps {
  (hits: number, misses: number, size: number): CacheStats
}
export const CacheStats: CacheStatsOps = (hits, misses, size) => ({
  hits,
  misses,
  size
})
