import * as Equal from "@fp-ts/data/Equal"
import * as Hash from "@fp-ts/data/Hash"

export const MapKeyURI = Symbol.for("@effect/cache/Cache/MapKey")
export type MapKeyURI = typeof MapKeyURI

/**
 * A `MapKey` represents a key in the cache. It contains mutable references
 * to the previous key and next key in the `KeySet` to support an efficient
 * implementation of a sorted set of keys.
 */
export class MapKey<Key> implements Equal.Equal {
  readonly [MapKeyURI]: MapKeyURI = MapKeyURI

  previous: MapKey<Key> | undefined = undefined
  next: MapKey<Key> | undefined = undefined

  constructor(readonly value: Key) {}

  [Hash.symbol](): number {
    return Hash.combine(
      Hash.combine(
        Hash.hash(this.next)
      )(Hash.hash(this.previous))
    )(Hash.hash(this.value))
  }

  [Equal.symbol](that: unknown): boolean {
    if (this === that) {
      return true
    }
    return isMapKey(that) &&
      Equal.equals(this.value, that.value) &&
      Equal.equals(this.previous, that.previous) &&
      Equal.equals(this.next, that.next)
  }
}

/**
 * @tsplus static effect/cache/Cache/MapKey.Ops is
 */
export function isMapKey(u: unknown): u is MapKey<unknown> {
  return typeof u === "object" && u != null && MapKeyURI in u
}
