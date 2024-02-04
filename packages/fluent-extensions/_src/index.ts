import { toNonEmptyArray } from "@effect-app/core/Array"
import type * as Cause from "effect/Cause"
import * as Eff from "effect/Effect"
import * as Opt from "effect/Option"
import type { NonEmptyArray } from "effect/ReadonlyArray"
import type { Concurrency, NoInfer } from "effect/Types"
import "./builtin.js"
import { Either } from "effect"
import type { Effect } from "effect/Effect"
import type { LazyArg } from "effect/Function"
import type { Option } from "effect/Option"

/**
 * useful in e.g frontend projects that do not use tsplus, but still has the most useful extensions installed.
 */
const installFluentExtensions = () => {
  Object.defineProperty(Object.prototype, "andThen", {
    enumerable: false,
    configurable: true,
    value(arg: any) {
      return Eff.isEffect(this)
        ? Eff.andThen(this, arg)
        : Opt.isOption(this)
        ? Opt.andThen(this, arg)
        : Either.andThen(this, arg)
    }
  })
  Object.defineProperty(Object.prototype, "tap", {
    enumerable: false,
    configurable: true,
    value(arg: any) {
      return Eff.isEffect(this)
        ? Eff.tap(this, arg)
        : Opt.tap(this, arg)
    }
  })

  Object.defineProperty(Object.prototype, "map", {
    enumerable: false,
    configurable: true,
    value(arg: any) {
      return Eff.isEffect(this)
        ? Eff.map(this, arg)
        : Opt.isOption(this)
        ? Opt.map(this, arg)
        : Either.map(this, arg)
    }
  })

  Object.defineProperty(Object.prototype, "getOrElse", {
    enumerable: false,
    configurable: true,
    value(arg: () => any) {
      return Opt.getOrElse(this, arg)
    }
  })

  Object.defineProperty(Object.prototype, "forEachEffect", {
    enumerable: false,
    configurable: true,
    value(arg: () => any) {
      return Eff.forEach(this, arg)
    }
  })

  Object.defineProperty(Array.prototype, "toNonEmpty", {
    enumerable: false,
    configurable: true,
    get() {
      return toNonEmptyArray(this)
    }
  })
}

installFluentExtensions()

declare module "effect/Option" {
  export interface None<out A> {
    get value(): A | undefined
    andThen<A, B>(this: Option<A>, f: (a: A) => Option<B>): Option<B>
    andThen<A, B>(this: Option<A>, f: Option<B>): Option<B>
    tap<A, _>(this: Option<A>, f: (a: A) => Option<_>): Option<A>
    getOrElse<A, B>(this: Option<A>, onNone: LazyArg<B>): A | B
    map<A, B>(this: Option<A>, f: (a: A) => B): Option<B>
  }
  export interface Some<out A> {
    andThen<A, B>(this: Option<A>, f: (a: A) => Option<B>): Option<B>
    andThen<A, B>(this: Option<A>, f: Option<B>): Option<B>
    tap<A, _>(this: Option<A>, f: (a: A) => Option<_>): Option<A>
    getOrElse<A, B>(this: Option<A>, onNone: LazyArg<B>): A | B
    map<A, B>(this: Option<A>, f: (a: A) => B): Option<B>
  }
}

declare module "effect/Either" {
  export interface Left<out E, out A> {
    andThen<E1, A, E2, B>(this: Either<E1, A>, f: (a: A) => Either<E2, B>): Either<E1 | E2, B>
    andThen<E1, A, E2, B>(this: Either<E1, A>, f: Either<E2, B>): Either<E1 | E2, B>
    map<E, A, B>(this: Either<E, A>, f: (a: A) => B): Either<E, B>
    get right(): A | undefined
  }
  export interface Right<out E, out A> {
    andThen<E1, A, E2, B>(this: Either<E1, A>, f: (a: A) => Either<E2, B>): Either<E1 | E2, B>
    andThen<E1, A, E2, B>(this: Either<E1, A>, f: Either<E2, B>): Either<E1 | E2, B>
    map<E, A, B>(this: Either<E, A>, f: (a: A) => B): Either<E, B>
    get left(): E | undefined
  }
}

declare global {
  interface Iterable<T> {
    forEachEffect<A, R, E, B>(
      this: Iterable<A>,
      f: (a: A, i: number) => Effect<R, E, B>,
      options?: {
        readonly concurrency?: Concurrency | undefined
        readonly batching?: boolean | "inherit" | undefined
        readonly discard?: false | undefined
      }
    ): Effect<R, E, Array<B>>
    forEachEffect<A, R, E, B>(
      this: Iterable<A>,
      f: (a: A, i: number) => Effect<R, E, B>,
      options: {
        readonly concurrency?: Concurrency | undefined
        readonly batching?: boolean | "inherit" | undefined
        readonly discard: true
      }
    ): Effect<R, E, void>
  }

  interface Array<T> {
    get toNonEmpty(): Option<NonEmptyArray<T>>
    forEachEffect<A, R, E, B>(
      this: Iterable<A>,
      f: (a: A, i: number) => Effect<R, E, B>,
      options?: {
        readonly concurrency?: Concurrency | undefined
        readonly batching?: boolean | "inherit" | undefined
        readonly discard?: false | undefined
      }
    ): Effect<R, E, Array<B>>
    forEachEffect<A, R, E, B>(
      this: Iterable<A>,
      f: (a: A, i: number) => Effect<R, E, B>,
      options: {
        readonly concurrency?: Concurrency | undefined
        readonly batching?: boolean | "inherit" | undefined
        readonly discard: true
      }
    ): Effect<R, E, void>
  }
  interface Set<T> {
    forEachEffect<A, R, E, B>(
      this: Iterable<A>,
      f: (a: A, i: number) => Effect<R, E, B>,
      options?: {
        readonly concurrency?: Concurrency | undefined
        readonly batching?: boolean | "inherit" | undefined
        readonly discard?: false | undefined
      }
    ): Effect<R, E, Array<B>>
    forEachEffect<A, R, E, B>(
      this: Iterable<A>,
      f: (a: A, i: number) => Effect<R, E, B>,
      options: {
        readonly concurrency?: Concurrency | undefined
        readonly batching?: boolean | "inherit" | undefined
        readonly discard: true
      }
    ): Effect<R, E, void>
  }
  interface ReadonlySet<T> {
    forEachEffect<A, R, E, B>(
      this: Iterable<A>,
      f: (a: A, i: number) => Effect<R, E, B>,
      options?: {
        readonly concurrency?: Concurrency | undefined
        readonly batching?: boolean | "inherit" | undefined
        readonly discard?: false | undefined
      }
    ): Effect<R, E, Array<B>>
    forEachEffect<A, R, E, B>(
      this: Iterable<A>,
      f: (a: A, i: number) => Effect<R, E, B>,
      options: {
        readonly concurrency?: Concurrency | undefined
        readonly batching?: boolean | "inherit" | undefined
        readonly discard: true
      }
    ): Effect<R, E, void>
  }
  interface Map<K, V> {
    forEachEffect<A, R, E, B>(
      this: Iterable<A>,
      f: (a: A, i: number) => Effect<R, E, B>,
      options?: {
        readonly concurrency?: Concurrency | undefined
        readonly batching?: boolean | "inherit" | undefined
        readonly discard?: false | undefined
      }
    ): Effect<R, E, Array<B>>
    forEachEffect<A, R, E, B>(
      this: Iterable<A>,
      f: (a: A, i: number) => Effect<R, E, B>,
      options: {
        readonly concurrency?: Concurrency | undefined
        readonly batching?: boolean | "inherit" | undefined
        readonly discard: true
      }
    ): Effect<R, E, void>
  }
  interface ReadonlyMap<K, V> {
    forEachEffect<A, R, E, B>(
      this: Iterable<A>,
      f: (a: A, i: number) => Effect<R, E, B>,
      options?: {
        readonly concurrency?: Concurrency | undefined
        readonly batching?: boolean | "inherit" | undefined
        readonly discard?: false | undefined
      }
    ): Effect<R, E, Array<B>>
    forEachEffect<A, R, E, B>(
      this: Iterable<A>,
      f: (a: A, i: number) => Effect<R, E, B>,
      options: {
        readonly concurrency?: Concurrency | undefined
        readonly batching?: boolean | "inherit" | undefined
        readonly discard: true
      }
    ): Effect<R, E, void>
  }
  interface ReadonlyArray<T> {
    get toNonEmpty(): Option<NonEmptyArray<T>>
    forEachEffect<A, R, E, B>(
      this: Iterable<A>,
      f: (a: A, i: number) => Effect<R, E, B>,
      options?: {
        readonly concurrency?: Concurrency | undefined
        readonly batching?: boolean | "inherit" | undefined
        readonly discard?: false | undefined
      }
    ): Effect<R, E, Array<B>>
    forEachEffect<A, R, E, B>(
      this: Iterable<A>,
      f: (a: A, i: number) => Effect<R, E, B>,
      options: {
        readonly concurrency?: Concurrency | undefined
        readonly batching?: boolean | "inherit" | undefined
        readonly discard: true
      }
    ): Effect<R, E, void>
  }
}

declare module "effect/Effect" {
  export interface Effect<R, E, A> {
    andThen<A, R, E, X>(
      this: Effect<R, E, A>,
      f: (a: NoInfer<A>) => X
    ): [X] extends [Effect<infer R1, infer E1, infer A1>] ? Effect<R | R1, E | E1, A1>
      : [X] extends [Promise<infer A1>] ? Effect<R, Cause.UnknownException | E, A1>
      : Effect<R, E, X>

    andThen<A, R, E, X>(
      this: Effect<R, E, A>,
      f: X
    ): [X] extends [Effect<infer R1, infer E1, infer A1>] ? Effect<R | R1, E | E1, A1>
      : [X] extends [Promise<infer A1>] ? Effect<R, Cause.UnknownException | E, A1>
      : Effect<R, E, X>
    tap<A, R, E, X>(
      this: Effect<R, E, A>,
      f: (a: NoInfer<A>) => X
    ): [X] extends [Effect<infer R1, infer E1, infer _A1>] ? Effect<R | R1, E | E1, A>
      : [X] extends [Promise<infer _A1>] ? Effect<R, Cause.UnknownException | E, A>
      : Effect<R, E, A>
    tap<A, R, E, X>(
      this: Effect<R, E, A>,
      f: X
    ): [X] extends [Effect<infer R1, infer E1, infer _A1>] ? Effect<R | R1, E | E1, A>
      : [X] extends [Promise<infer _A1>] ? Effect<R, Cause.UnknownException | E, A>
      : Effect<R, E, A>
  }
}
