/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  /**
   * @tsplus type effect/data/ReadonlyArray
   * @tsplus type ReadonlyArray
   * @tsplus type Iterable
   * @tsplus companion effect/data/Array.Ops
   * @tsplus companion Array.Ops
   */
  interface ReadonlyArray<T> {}

  /**
   * @tsplus type Iterable
   */
  interface Iterable<T> {}

  // * @tsplus companion Array.Ops causes "Error: Debug Failure. False expression: Should only get Alias here."
  /**
   * @tsplus type ReadonlyArray
   * @tsplus type Array
   * @tsplus type Iterable
   */
  interface Array<T> {}

  /**
   * @tsplus type ets/Set
   * @tsplus type Iterable
   */
  interface Set<T> {}

  /**
   * @tsplus type ets/ReadonlySet
   * @tsplus type ets/Set
   * @tsplus type Iterable
   */
  interface ReadonlySet<T> {}

  /**
   * @tsplus type ets/Map
   * @tsplus type Iterable
   */
  interface Map<K, V> {}

  /**
   * @tsplus type ets/Map
   * @tsplus type Iterable
   */
  interface ReadonlyMap<K, V> {}
  /**
   * @tsplus type Date
   */
  interface Date {}

  // /**
  //  * @tsplus type Record
  //  */
  // interface Record<K, V> {}

  /**
   * @tsplus type Object
   */
  interface Object {}

  /**
   * @tsplus type Generator
   * @tsplus type Iterator
   */
  interface Generator<T = unknown, TReturn = any, TNext = unknown> {}

  /**
   * @tsplus type Iterator
   */
  interface Iterator<T, TReturn = any, TNext = undefined> {}

  /**
   * @tsplus type function
   */
  interface Function {}

  /**
   * @tsplus type string
   */
  export interface String {}
  /**
   * @tsplus type number
   */
  export interface Number {}
  /**
   * @tsplus type boolean
   */
  export interface Boolean {}
  /**
   * @tsplus type bigint
   */
  export interface BigInt {}

  /**
   * @tsplus type regexp
   */
  export interface RegExp {}

  /**
   * @tsplus type string.Ops
   */
  export interface StringConstructor {}

  /**
   * @tsplus type number
   */
  export interface Number {}

  /**
   * @tsplus type Date
   */
  interface Date {}
}
