/**
 * A `Lookup` represents a lookup function that, given a key of type `Key`, can
 * return an `Effect` that will either produce a value of type `Value` or
 * fail with an error of type `Error` using an environment of type
 * `Environment`.
 *
 * You can think of a `Lookup` as an effectual function that computes a value
 * given a key. Given any effectual function you can convert it to a lookup
 * function for a cache by using the `Lookup` constructor.
 *
 * @tsplus type effect/cache/Lookup
 */
export interface Lookup<Key, Environment, Error, Value> {
  (key: Key): Effect<Environment, Error, Value>
}
