declare global {
  /**
   * @tsplus type ets/Array
   */
  interface ReadonlyArray<T> {}

  /**
   * @tsplus type ets/Array
   */
  interface Array<T> {}

  /**
   * @tsplus type ets/Set
   */
  interface Set<T> {}

  /**
   * @tsplus type ets/ROSet
   * @tsplus type ets/Set
   */
  interface ReadonlySet<T> {}

  /**
   * @tsplus type ets/Map
   */
  interface Map<K, V> {}

  /**
   * @tsplus type ets/Map
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
}
