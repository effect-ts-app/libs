declare global {
  interface String {
    /**
     * Split a string into substrings using the specified separator and return them as an array.
     * @param splitter An object that can split a string.
     * @param limit A value used to limit the number of elements returned in the array.
     */
    split(splitter: { [Symbol.split](string: string, limit?: number): string[] }, limit?: number): [string, ...string[]]

    /**
     * Split a string into substrings using the specified separator and return them as an array.
     * @param separator A string that identifies character or characters to use in separating the string. If omitted, a single-element array containing the entire string is returned.
     * @param limit A value used to limit the number of elements returned in the array.
     */
    split(separator: string | RegExp, limit?: number): [string, ...string[]]
  }

  interface JSON {
    /**
     * Converts a JavaScript Object Notation (JSON) string into an object.
     * @param text A valid JSON string.
     * @param reviver A function that transforms the results. This function is called for each member of the object.
     * If a member contains nested objects, the nested objects are transformed before the parent object is.
     */
    parse(text: string, reviver?: (this: any, key: string, value: any) => any): unknown
  }

  interface Body {
    json(): Promise<unknown>
  }

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
