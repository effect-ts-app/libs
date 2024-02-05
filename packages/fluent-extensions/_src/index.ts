/* eslint-disable @typescript-eslint/no-explicit-any */
import { toNonEmptyArray } from "@effect-app/core/Array"
import type * as Cause from "effect/Cause"
import * as Eff from "effect/Effect"
import * as Opt from "effect/Option"
import type { NonEmptyArray } from "effect/ReadonlyArray"
import type { Concurrency, NoInfer } from "effect/Types"
import "./builtin.js"
import { Either, pipe, ReadonlyArray } from "effect"
import type { Effect } from "effect/Effect"
import type { LazyArg } from "effect/Function"
import type { Option } from "effect/Option"

const settings = {
  enumerable: false,
  configurable: true,
  writable: true
}
/**
 * useful in e.g frontend projects that do not use tsplus, but still has the most useful extensions installed.
 */
const installFluentExtensions = () => {
  Object.defineProperty(Object.prototype, "pipe", {
    ...settings,
    value(...args: [any, ...any[]]) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return pipe(this, ...args as [any])
    }
  })

  Object.defineProperty(Object.prototype, "andThen", {
    ...settings,
    value(arg: any) {
      return Opt.isOption(this)
        ? Opt.andThen(this, arg)
        : Either.isEither(this)
        ? Either.andThen(this, arg)
        : Eff.andThen(this, arg)
    }
  })
  Object.defineProperty(Object.prototype, "tap", {
    ...settings,
    value(arg: any) {
      return Opt.isOption(this) ? Opt.tap(this, arg) : Eff.tap(this, arg)
    }
  })

  Object.defineProperty(Object.prototype, "map", {
    ...settings,
    value(arg: any) {
      return Opt.isOption(this)
        ? Opt.map(this, arg)
        : Either.isEither(this)
        ? Either.map(this, arg)
        : Eff.map(this, arg)
    }
  })

  Object.defineProperty(Object.prototype, "getOrElse", {
    ...settings,
    value(arg: () => any) {
      return Opt.getOrElse(this, arg)
    }
  })

  Object.defineProperty(Object.prototype, "forEachEffect", {
    ...settings,
    value(arg: () => any) {
      return Eff.forEach(this, arg)
    }
  })

  Object.defineProperty(Array.prototype, "findFirstMap", {
    ...settings,
    value(arg: () => any) {
      return ReadonlyArray.findFirst(this, arg)
    }
  })

  Object.defineProperty(Array.prototype, "filterMap", {
    ...settings,
    value(arg: () => any) {
      return ReadonlyArray.filterMap(this, arg)
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
  interface Object {
    pipe<A, B>(this: A, ab: (a: A) => B): B
    pipe<A, B, C>(this: A, ab: (a: A) => B, bc: (b: B) => C): C
    pipe<A, B, C, D>(this: A, ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D): D
    pipe<A, B, C, D, E>(
      this: A,
      ab: (a: A) => B,
      bc: (b: B) => C,
      cd: (c: C) => D,
      de: (d: D) => E
    ): E
    pipe<A, B, C, D, E, F>(
      this: A,
      ab: (a: A) => B,
      bc: (b: B) => C,
      cd: (c: C) => D,
      de: (d: D) => E,
      ef: (e: E) => F
    ): F
    pipe<A, B, C, D, E, F, G>(
      this: A,
      ab: (a: A) => B,
      bc: (b: B) => C,
      cd: (c: C) => D,
      de: (d: D) => E,
      ef: (e: E) => F,
      fg: (f: F) => G
    ): G
    pipe<A, B, C, D, E, F, G, H>(
      this: A,
      ab: (a: A) => B,
      bc: (b: B) => C,
      cd: (c: C) => D,
      de: (d: D) => E,
      ef: (e: E) => F,
      fg: (f: F) => G,
      gh: (g: G) => H
    ): H
    pipe<A, B, C, D, E, F, G, H, I>(
      this: A,
      ab: (a: A) => B,
      bc: (b: B) => C,
      cd: (c: C) => D,
      de: (d: D) => E,
      ef: (e: E) => F,
      fg: (f: F) => G,
      gh: (g: G) => H,
      hi: (h: H) => I
    ): I
    pipe<A, B, C, D, E, F, G, H, I, J>(
      this: A,
      ab: (a: A) => B,
      bc: (b: B) => C,
      cd: (c: C) => D,
      de: (d: D) => E,
      ef: (e: E) => F,
      fg: (f: F) => G,
      gh: (g: G) => H,
      hi: (h: H) => I,
      ij: (i: I) => J
    ): J
    pipe<A, B, C, D, E, F, G, H, I, J, K>(
      this: A,
      ab: (a: A) => B,
      bc: (b: B) => C,
      cd: (c: C) => D,
      de: (d: D) => E,
      ef: (e: E) => F,
      fg: (f: F) => G,
      gh: (g: G) => H,
      hi: (h: H) => I,
      ij: (i: I) => J,
      jk: (j: J) => K
    ): K
    pipe<A, B, C, D, E, F, G, H, I, J, K, L>(
      this: A,
      ab: (a: A) => B,
      bc: (b: B) => C,
      cd: (c: C) => D,
      de: (d: D) => E,
      ef: (e: E) => F,
      fg: (f: F) => G,
      gh: (g: G) => H,
      hi: (h: H) => I,
      ij: (i: I) => J,
      jk: (j: J) => K,
      kl: (k: K) => L
    ): L
    pipe<A, B, C, D, E, F, G, H, I, J, K, L, M>(
      this: A,
      ab: (a: A) => B,
      bc: (b: B) => C,
      cd: (c: C) => D,
      de: (d: D) => E,
      ef: (e: E) => F,
      fg: (f: F) => G,
      gh: (g: G) => H,
      hi: (h: H) => I,
      ij: (i: I) => J,
      jk: (j: J) => K,
      kl: (k: K) => L,
      lm: (l: L) => M
    ): M
    pipe<A, B, C, D, E, F, G, H, I, J, K, L, M, N>(
      this: A,
      ab: (a: A) => B,
      bc: (b: B) => C,
      cd: (c: C) => D,
      de: (d: D) => E,
      ef: (e: E) => F,
      fg: (f: F) => G,
      gh: (g: G) => H,
      hi: (h: H) => I,
      ij: (i: I) => J,
      jk: (j: J) => K,
      kl: (k: K) => L,
      lm: (l: L) => M,
      mn: (m: M) => N
    ): N
    pipe<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O>(
      this: A,
      ab: (a: A) => B,
      bc: (b: B) => C,
      cd: (c: C) => D,
      de: (d: D) => E,
      ef: (e: E) => F,
      fg: (f: F) => G,
      gh: (g: G) => H,
      hi: (h: H) => I,
      ij: (i: I) => J,
      jk: (j: J) => K,
      kl: (k: K) => L,
      lm: (l: L) => M,
      mn: (m: M) => N,
      no: (n: N) => O
    ): O
    pipe<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P>(
      this: A,
      ab: (a: A) => B,
      bc: (b: B) => C,
      cd: (c: C) => D,
      de: (d: D) => E,
      ef: (e: E) => F,
      fg: (f: F) => G,
      gh: (g: G) => H,
      hi: (h: H) => I,
      ij: (i: I) => J,
      jk: (j: J) => K,
      kl: (k: K) => L,
      lm: (l: L) => M,
      mn: (m: M) => N,
      no: (n: N) => O,
      op: (o: O) => P
    ): P
    pipe<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q>(
      this: A,
      ab: (a: A) => B,
      bc: (b: B) => C,
      cd: (c: C) => D,
      de: (d: D) => E,
      ef: (e: E) => F,
      fg: (f: F) => G,
      gh: (g: G) => H,
      hi: (h: H) => I,
      ij: (i: I) => J,
      jk: (j: J) => K,
      kl: (k: K) => L,
      lm: (l: L) => M,
      mn: (m: M) => N,
      no: (n: N) => O,
      op: (o: O) => P,
      pq: (p: P) => Q
    ): Q
    pipe<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R>(
      this: A,
      ab: (a: A) => B,
      bc: (b: B) => C,
      cd: (c: C) => D,
      de: (d: D) => E,
      ef: (e: E) => F,
      fg: (f: F) => G,
      gh: (g: G) => H,
      hi: (h: H) => I,
      ij: (i: I) => J,
      jk: (j: J) => K,
      kl: (k: K) => L,
      lm: (l: L) => M,
      mn: (m: M) => N,
      no: (n: N) => O,
      op: (o: O) => P,
      pq: (p: P) => Q,
      qr: (q: Q) => R
    ): R
    pipe<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S>(
      this: A,
      ab: (a: A) => B,
      bc: (b: B) => C,
      cd: (c: C) => D,
      de: (d: D) => E,
      ef: (e: E) => F,
      fg: (f: F) => G,
      gh: (g: G) => H,
      hi: (h: H) => I,
      ij: (i: I) => J,
      jk: (j: J) => K,
      kl: (k: K) => L,
      lm: (l: L) => M,
      mn: (m: M) => N,
      no: (n: N) => O,
      op: (o: O) => P,
      pq: (p: P) => Q,
      qr: (q: Q) => R,
      rs: (r: R) => S
    ): S
    pipe<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T>(
      this: A,
      ab: (a: A) => B,
      bc: (b: B) => C,
      cd: (c: C) => D,
      de: (d: D) => E,
      ef: (e: E) => F,
      fg: (f: F) => G,
      gh: (g: G) => H,
      hi: (h: H) => I,
      ij: (i: I) => J,
      jk: (j: J) => K,
      kl: (k: K) => L,
      lm: (l: L) => M,
      mn: (m: M) => N,
      no: (n: N) => O,
      op: (o: O) => P,
      pq: (p: P) => Q,
      qr: (q: Q) => R,
      rs: (r: R) => S,
      st: (s: S) => T
    ): T
  }
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

  interface ReadonlyArray<T> {
    get toNonEmpty(): Option<NonEmptyArray<T>>
    findFirstMap<A, B>(this: Iterable<A>, f: (a: A, i: number) => Option<B>): Option<B>
    findFirstMap<A, B extends A>(this: Iterable<A>, refinement: (a: A, i: number) => a is B): Option<B>
    findFirstMap<A>(this: Iterable<A>, predicate: (a: A, i: number) => boolean): Option<A>
    filterMap<A, B>(this: Iterable<A>, f: (a: A, i: number) => Option<B>): Array<B>
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
    findFirstMap<A, B>(this: Iterable<A>, f: (a: A, i: number) => Option<B>): Option<B>
    findFirstMap<A, B extends A>(this: Iterable<A>, refinement: (a: A, i: number) => a is B): Option<B>
    findFirstMap<A>(this: Iterable<A>, predicate: (a: A, i: number) => boolean): Option<A>
    filterMap<A, B>(this: Iterable<A>, f: (a: A, i: number) => Option<B>): Array<B>
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
}

declare module "effect/Cause" {
  export interface YieldableError {
    andThen<A, R, E, X>(
      this: Effect<R, E, A>,
      f: (a: NoInfer<A>) => X
    ): [X] extends [Effect<infer R1, infer E1, infer A1>] ? Effect<R | R1, E | E1, A1>
      : [X] extends [Promise<infer A1>] ? Effect<R, UnknownException | E, A1>
      : Effect<R, E, X>

    andThen<A, R, E, X>(
      this: Effect<R, E, A>,
      f: X
    ): [X] extends [Effect<infer R1, infer E1, infer A1>] ? Effect<R | R1, E | E1, A1>
      : [X] extends [Promise<infer A1>] ? Effect<R, UnknownException | E, A1>
      : Effect<R, E, X>
    tap<A, R, E, X>(
      this: Effect<R, E, A>,
      f: (a: NoInfer<A>) => X
    ): [X] extends [Effect<infer R1, infer E1, infer _A1>] ? Effect<R | R1, E | E1, A>
      : [X] extends [Promise<infer _A1>] ? Effect<R, UnknownException | E, A>
      : Effect<R, E, A>
    tap<A, R, E, X>(
      this: Effect<R, E, A>,
      f: X
    ): [X] extends [Effect<infer R1, infer E1, infer _A1>] ? Effect<R | R1, E | E1, A>
      : [X] extends [Promise<infer _A1>] ? Effect<R, UnknownException | E, A>
      : Effect<R, E, A>
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
