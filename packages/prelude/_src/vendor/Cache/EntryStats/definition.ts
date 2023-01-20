/**
 * An `EntryStats` represents a snapshot of statistics for an entry in the
 * cache.
 *
 * @tsplus type effect/cache/EntryStats
 */
export interface EntryStats {
  readonly loadedMillis: number
}

/**
 * @tsplus type effect/cache/EntryStats.Ops
 */
export interface EntryStatsOps {
  (loadedMillis: number): EntryStats
}
export const EntryStats: EntryStatsOps = (loadedMillis) => ({
  loadedMillis
})
