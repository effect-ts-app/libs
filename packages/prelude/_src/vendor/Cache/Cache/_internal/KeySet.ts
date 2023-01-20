import type { MapKey } from "./MapKey.js"

/**
 * A `KeySet` is a sorted set of keys in the cache ordered by last access.
 * For efficiency, the set is implemented in terms of a doubly linked list
 * and is not safe for concurrent access.
 */
export class KeySet<Key> {
  head: MapKey<Key> | undefined = undefined
  tail: MapKey<Key> | undefined = undefined

  /**
   * Adds the specified key to the set.
   */
  add(key: MapKey<Key>): void {
    if (!Equal.equals(key, this.tail)) {
      if (this.tail != null) {
        const previous = key.previous
        const next = key.next
        if (next != null) {
          key.next = undefined
          if (previous != null) {
            previous.next = next
            next.previous = previous
          } else {
            this.head = next
            this.head.previous = undefined
          }
        }
        this.tail.next = key
        key.previous = this.tail
        this.tail = key
      } else {
        this.head = key
        this.tail = key
      }
    }
  }

  /**
   * Removes the lowest priority key from the set.
   */
  remove(): MapKey<Key> | undefined {
    const key = this.head
    if (key != null) {
      const next = key.next
      if (next) {
        key.next = undefined
        this.head = next
        this.head.previous = undefined
      } else {
        this.head = undefined
        this.tail = undefined
      }
    }
    return key
  }
}
