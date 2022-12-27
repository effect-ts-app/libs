declare global {
  /**
   * @tsplus type fp-ts/data/ReadonlyArray
   * @tsplus type ReadonlyArray
   * @tsplus type Iterable
   * @tsplus companion fp-ts/data/ReadonlyArray.Ops
   * @tsplus companion ReadonlyArray.Ops
   */
  interface ReadonlyArray<T> {}

  /**
   * @tsplus type Iterable
   */
  interface Iterable<T> {}

  /**
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
   * @tsplus type ets/ROSet
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
   * @tsplus type Date
   */
  interface Date {}
}
