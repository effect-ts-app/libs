import { symbolEqual, symbolHash } from "@fp-ts/data/Equal"

export const MapKeyURI = Symbol.for("@effect/cache/Cache/MapKey")
export type MapKeyURI = typeof MapKeyURI

/**
 * A `MapKey` represents a key in the cache. It contains mutable references
 * to the previous key and next key in the `KeySet` to support an efficient
 * implementation of a sorted set of keys.
 */
export class MapKey<Key> implements Equals {
  readonly [MapKeyURI]: MapKeyURI = MapKeyURI

  previous: MapKey<Key> | undefined = undefined
  next: MapKey<Key> | undefined = undefined

  constructor(readonly value: Key) {}

  [symbolHash](): number {
    return Equals.hashCombine(
      Equals.hashCombine(
        Equals.hash(this.next)
      )(Equals.hash(this.previous))
    )(Equals.hash(this.value))
  }

  [symbolEqual](that: unknown): boolean {
    if (this === that) {
      return true
    }
    return isMapKey(that) &&
      Equals.equals(this.value, that.value) &&
      Equals.equals(this.previous, that.previous) &&
      Equals.equals(this.next, that.next)
  }
}

/**
 * @tsplus static effect/cache/Cache/MapKey.Ops is
 */
export function isMapKey(u: unknown): u is MapKey<unknown> {
  return typeof u === "object" && u != null && MapKeyURI in u
}
