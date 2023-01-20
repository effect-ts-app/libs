import type { Lens } from "@effect-ts/monocle/Lens";

// TODO: move gloal


declare module "@effect-ts/monocle/Lens" {
  export interface Base<S, A> extends Lens<S, A> {}

  /**
   * @tsplus type ets/Lens
   */
  export interface Lens<S, A> {}
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
  export type Either<E, A> = Left<E> | Right<A>;
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
  export type Option<A> = None | Some<A>;
}
