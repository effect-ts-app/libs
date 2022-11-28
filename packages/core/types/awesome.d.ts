import { XPure } from "@effect-ts/core/XPure/index"

// TODO: move gloal

declare global {
  /**
   * @tsplus type ets/Array
   */
  interface ReadonlyArray<T> { }

  /**
   * @tsplus type ets/Array
   */
  interface Array<T> { }

  /**
   * @tsplus type ets/Set
   */
  interface Set<T> {}
  
  /**
   * @tsplus type ets/ROSet
   * @tsplus type ets/Set
   */
  interface ReadonlySet<T> { }
  
  /**
   * @tsplus type ets/Map
   */
  interface Map<K, V> { }
  
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


declare module "@effect-ts/monocle/Lens" {
  export interface Base<S, A> extends Lens<S, A> {}

  /**
   * @tsplus type ets/Lens
   */
  export interface Lens<S, A> {}
}

declare module "@effect-ts/system/Has" {
  /**
   * @tsplus type ets/Has
   */
  export interface Has<T> {}

  /**
   * @tsplus type ets/Tag
   */
  export interface Tag<T> {}
}

declare module "@effect-ts/system/Effect/effect" {
  /**
   * @tsplus type ets/Effect
   */
  export interface Effect<R, E, A> {}
}

declare module "@effect-ts/system/Either/core" {
  /**
   * @tsplus type ets/Either/Left
   */
  export interface Left<E> {}
  /**
   * @tsplus type ets/Either/Right
   */
  export interface Right<A> {}

  /**
   * @tsplus type ets/Either
   */
  export type Either<E, A> = Left<E> | Right<A>
}

declare module "@effect-ts/system/Option/core" {
  /**
   * @tsplus type ets/Maybe/Some
   */
  export interface Some<A> {}

  /**
   * @tsplus type ets/Maybe/None
   */

  export interface None {}

  /**
   * @tsplus type ets/Maybe
   */
  export type Option<A> = None | Some<A>
}

declare module "@effect-ts/system/Sync/core" {
  /**
   * @tsplus type ets/Sync
   */
  export interface Sync<R, E, A> extends XPure<unknown, unknown, unknown, R, E, A> {}
}

declare module "@effect-ts/system/Managed/managed" {
  /**
   * @tsplus type ets/Managed
   */
  export interface Managed<R, E, A> {}
}
