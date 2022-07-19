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

  // /**
  //  * @tsplus type ets/Either
  //  */
  // export type Either<E, A> = Left<E> | Right<A>
}

declare module "@effect-ts/system/Option/core" {
  /**
   * @tsplus type ets/Option/Some
   */
  export interface Some<A> extends Ops<A> {}

  /**
   * @tsplus type ets/Option/None
   */

  export interface None extends Ops<never> {}

  // /**
  //  * @tsplus type ets/Option
  //  */
  // export interface Option<A> {}
}

declare global {
  /**
   * @tsplus type ets/ROSet
   */
  interface ReadonlySet<T> extends ReadonlySetOps {}
}

declare module "@effect-ts/system/Sync/core" {
  /**
   * @tsplus type ets/Sync
   */
  export interface Sync<R, E, A> extends XPure<unknown, unknown, unknown, R, E, A> {}
}
