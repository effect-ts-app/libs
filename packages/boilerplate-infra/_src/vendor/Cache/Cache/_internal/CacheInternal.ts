import type { Clock } from "@effect/io/Clock"
import { Deferred } from "@effect/io/Deferred"
import type { FiberId } from "@effect/io/Fiber/Id"
import { CacheStats } from "../../CacheStats.js"
import { EntryStats } from "../../EntryStats.js"
import type { Lookup } from "../../Lookup.js"
import type { Cache } from "../definition.js"
import { CacheURI } from "../definition.js"
import { CacheState } from "./CacheState.js"
import { MapKey } from "./MapKey.js"
import type { MapValue } from "./MapValue.js"
import { Complete, Pending, Refreshing } from "./MapValue.js"

export class CacheInternal<Key, Environment, Error, Value> implements Cache<Key, Error, Value> {
  readonly [CacheURI] = {
    _Key: (_: Key) => void 0,
    _Error: (_: never) => _,
    _Value: (_: never) => _
  }

  private cacheState: CacheState<Key, Error, Value>

  constructor(
    readonly capacity: number,
    readonly lookup: Lookup<Key, Environment, Error, Value>,
    readonly timeToLive: (exit: Exit<Error, Value>) => Duration,
    readonly clock: Clock,
    readonly environment: Context<Environment>,
    readonly fiberId: FiberId
  ) {
    this.cacheState = CacheState.initial<Key, Error, Value>()
  }

  get size(): Effect<never, never, number> {
    return Effect.sync(() => this.cacheState.map.size)
  }

  get entries(): Effect<never, never, Chunk<readonly [Key, Value]>> {
    return Effect.sync(() => {
      const entries: Array<readonly [Key, Value]> = []
      for (const [key, value] of this.cacheState.map) {
        if (value._tag === "Complete" && value.exit._tag === "Success") {
          entries.push([key, value.exit.value] as const)
        }
      }
      return Chunk.fromIterable(entries)
    })
  }

  get values(): Effect<never, never, Chunk<Value>> {
    return Effect.sync(() => {
      const values: Array<Value> = []
      for (const [_, value] of this.cacheState.map) {
        if (value._tag === "Complete" && value.exit._tag === "Success") {
          values.push(value.exit.value)
        }
      }
      return Chunk.fromIterable(values)
    })
  }

  get cacheStats(): Effect<never, never, CacheStats> {
    return Effect.succeed(CacheStats(
      this.cacheState.hits,
      this.cacheState.misses,
      this.cacheState.map.size
    ))
  }

  entryStats(k: Key): Effect<never, never, Opt<EntryStats>> {
    return Effect.sync(() => {
      const value = this.cacheState.map.get(k).value
      if (value == null) {
        return Opt.none
      }
      switch (value._tag) {
        case "Pending": {
          return Opt.none
        }
        case "Complete": {
          return Opt.some(EntryStats(value.entryStats.loadedMillis))
        }
        case "Refreshing": {
          return Opt.some(EntryStats(value.complete.entryStats.loadedMillis))
        }
      }
    })
  }

  get(k: Key): Effect<never, Error, Value> {
    return Effect.suspendSucceed(() => {
      let key: MapKey<Key> | undefined = undefined
      let deferred: Deferred<Error, Value> | undefined = undefined
      let value = this.cacheState.map.get(k).value
      if (value == null) {
        deferred = Deferred.unsafeMake<Error, Value>(this.fiberId)
        key = new MapKey(k)
        if (this.cacheState.map.has(k)) {
          value = this.cacheState.map.get(k).value!
        } else {
          this.cacheState.map.set(k, new Pending(key, deferred))
        }
      }
      if (value == null) {
        this.trackAccess(key!)
        this.trackMiss()
        return this.lookupValueOf(k, deferred)
      }
      switch (value._tag) {
        case "Pending": {
          this.trackAccess(value.key)
          this.trackHit()
          return value.deferred.await
        }
        case "Complete": {
          this.trackAccess(value.key)
          this.trackHit()
          if (this.hasExpired(value.timeToLiveMillis)) {
            const found = this.cacheState.map.get(k).value
            if (Equals.equals(found, value)) {
              this.cacheState.map.remove(k)
            }
            return this.get(k)
          }
          return Effect.done(value.exit)
        }
        case "Refreshing": {
          this.trackAccess(value.complete.key)
          this.trackHit()
          if (this.hasExpired(value.complete.timeToLiveMillis)) {
            return value.deferred.await
          }
          return Effect.done(value.complete.exit)
        }
      }
    })
  }

  set(key: Key, value: Value): Effect<never, never, void> {
    return Effect.sync(() => {
      const now = this.clock.unsafeCurrentTime
      const lookupResult = Exit.succeed(value)
      this.cacheState.map.set(
        key,
        new Complete(
          new MapKey(key),
          lookupResult,
          EntryStats(now),
          now + this.timeToLive(lookupResult).millis
        )
      )
    })
  }

  contains(key: Key): Effect<never, never, boolean> {
    return Effect.sync(() => this.cacheState.map.has(key))
  }

  refresh(k: Key): Effect<never, Error, void> {
    return Effect.suspendSucceed(() => {
      const deferred = Deferred.unsafeMake<Error, Value>(this.fiberId)
      let value = this.cacheState.map.get(k).value
      if (value == null) {
        if (this.cacheState.map.has(k)) {
          value = this.cacheState.map.get(k).value!
        } else {
          this.cacheState.map.set(k, new Pending(new MapKey(k), deferred))
        }
      }
      if (value == null) {
        return this.lookupValueOf(k, deferred).unit
      }
      switch (value._tag) {
        case "Pending": {
          return value.deferred.await.unit
        }
        case "Complete": {
          if (this.hasExpired(value.timeToLiveMillis)) {
            const found = this.cacheState.map.get(k).value!
            if (Equals.equals(found, value)) {
              this.cacheState.map.remove(k)
            }
            return this.get(k).unit
          }
          // Only trigger the lookup if we're still the current value
          return Effect.when(
            () => {
              const current = this.cacheState.map.get(k).value
              if (Equals.equals(current, value)) {
                this.cacheState.map.set(
                  k,
                  new Refreshing(deferred, value as Complete<Key, Error, Value>)
                )
                return true
              }
              return false
            },
            this.lookupValueOf(value.key.value, deferred)
          ).unit
        }
        case "Refreshing": {
          return value.deferred.await.unit
        }
      }
    })
  }

  invalidate(key: Key): Effect<never, never, void> {
    return Effect.sync(() => {
      this.cacheState.map.remove(key)
    })
  }

  invalidateAll: Effect<never, never, void> = Effect.sync(() => {
    this.cacheState.map = MutableHashMap.empty<Key, MapValue<Key, Error, Value>>()
  })

  private trackHit(): void {
    this.cacheState.hits = this.cacheState.hits + 1
  }

  private trackMiss(): void {
    this.cacheState.misses = this.cacheState.misses + 1
  }

  private trackAccess(key: MapKey<Key>): void {
    this.cacheState.accesses.offer(key)
    if (this.cacheState.updating.compareAndSet(false, true)) {
      let loop = true
      while (loop) {
        const key = this.cacheState.accesses.poll(EmptyMutableQueue)
        if (key === EmptyMutableQueue) {
          loop = false
        } else {
          this.cacheState.keys.add(key)
        }
      }
      let size = this.cacheState.map.size
      loop = size > this.capacity
      while (loop) {
        const key = this.cacheState.keys.remove()
        if (key != null) {
          if (this.cacheState.map.remove(key.value) != null) {
            size = size - 1
            loop = size > this.capacity
          }
        } else {
          loop = false
        }
      }
      this.cacheState.updating.set(false)
    }
  }

  private lookupValueOf(key: Key, deferred: Deferred<Error, Value>): Effect<never, Error, Value> {
    return this.lookup(key)
      .provideEnvironment(this.environment)
      .exit
      .flatMap(exit => {
        const now = this.clock.unsafeCurrentTime
        const entryStats = EntryStats(now)
        this.cacheState.map.set(
          key,
          new Complete(
            new MapKey(key),
            exit,
            entryStats,
            now + this.timeToLive(exit).millis
          )
        )
        return deferred.done(exit).zipRight(Effect.done(exit))
      })
      .onInterrupt(() =>
        deferred.interrupt.zipRight(Effect.sync(() => {
          this.cacheState.map.remove(key)
        }))
      )
  }

  private hasExpired(timeToLiveMillis: number): boolean {
    return this.clock.unsafeCurrentTime > timeToLiveMillis
  }
}

/**
 * @tsplus macro remove
 */
export function concreteCache<Key, Error, Value>(
  _: Cache<Key, Error, Value>
): asserts _ is CacheInternal<Key, unknown, Error, Value> {
  //
}
