export const MapKeyURI = Symbol.for("@effect/cache/Cache/MapKey")
export type MapKeyURI = typeof MapKeyURI

/**
 * A `MapKey` represents a key in the cache. It contains mutable references
 * to the previous key and next key in the `KeySet` to support an efficient
 * implementation of a sorted set of keys.
 */
export class MapKey<Key> {
  readonly [MapKeyURI]: MapKeyURI = MapKeyURI

  previous: MapKey<Key> | undefined = undefined
  next: MapKey<Key> | undefined = undefined

  constructor(readonly value: Key) {}
}

/**
 * @tsplus static effect/cache/Cache/MapKey.Ops is
 */
export function isMapKey(u: unknown): u is MapKey<unknown> {
  return typeof u === "object" && u != null && MapKeyURI in u
}
