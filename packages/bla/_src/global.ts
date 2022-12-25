declare global {
  /**
   * @tsplus type ReadonlyArray
   * @tsplus type Iterable
   * @tsplus companion fp-ts/data/ReadonlyArray.Ops
   * @tsplus companion ReadonlyArray.Ops
   */
  interface ReadonlyArray<T> {}

  /**
   * @tsplus type Iterable
   */
  interface Array<T> {}

  /**
   * @tsplus type Iterable
   */
  interface Iterable<T> {}
}
