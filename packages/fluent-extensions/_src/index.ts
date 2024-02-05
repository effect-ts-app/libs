/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Cause from "effect/Cause"
import * as Config from "effect/Config"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Either from "effect/Either"
import * as Option from "effect/Option"
import type { NonEmptyArray } from "effect/ReadonlyArray"
import * as ReadonlyArray from "effect/ReadonlyArray"
import type { Concurrency, NoInfer } from "effect/Types"
import "./builtin.js"
import { pipe } from "effect"
import { Class, CommitPrototype, EffectPrototype, StructuralClass, StructuralCommitPrototype } from "effect/Effectable"
import type { LazyArg } from "effect/Function"

const toNonEmptyArray = <A>(a: ReadonlyArray<A>) =>
  a.length ? Option.some(a as ReadonlyArray.NonEmptyReadonlyArray<A>) : Option.none

const settings = {
  enumerable: false,
  configurable: true,
  writable: true
}
/**
 * useful in e.g frontend projects that do not use tsplus, but still has the most useful extensions installed.
 */
const installFluentExtensions = () => {
  // somehow individual prototypes don't stick in vite, so we still do some global ;/
  // we should however not do `map` as it breaks fast-check, etc

  Object.defineProperty(Object.prototype, "andThen", {
    ...settings,
    value(arg: any) {
      return Option.isOption(this)
        ? Option.andThen(this, arg)
        : Either.isEither(this)
        ? Either.andThen(this, arg)
        : Effect.andThen(this, arg)
    }
  })
  Object.defineProperty(Object.prototype, "tap", {
    ...settings,
    value(arg: any) {
      return Option.isOption(this) ? Option.tap(this, arg) : Effect.tap(this, arg)
    }
  })

  // Object.defineProperty(Object.prototype, "map", {
  //   ...settings,
  //   value(arg: any) {
  //     return Option.isOption(this)
  //       ? Option.map(this, arg)
  //       : Either.isEither(this)
  //       ? Either.map(this, arg)
  //       : Effect.map(this, arg)
  //   }
  // })

  Object.defineProperty(Object.prototype, "getOrElse", {
    ...settings,
    value(arg: () => any) {
      return Option.getOrElse(this, arg)
    }
  }) // individual
   // effects
  ;[
    ...[Effect.unit, Effect.fail(1), Effect.step(Effect.unit), Cause.empty, Config.succeed(1), Context.Tag()].map((
      effect
    ) => Object.getPrototypeOf(effect)),
    StructuralClass.prototype,
    Class.prototype,
    EffectPrototype, // get's spread into many
    CommitPrototype,
    StructuralCommitPrototype
    // STM.fail(1) // Stream?
  ]
    .forEach((effect) => {
      Object.assign(effect, {
        andThen(arg: any): any {
          return Effect.andThen(this as any, arg)
        },
        tap(arg: any): any {
          return Effect.tap(this as any, arg)
        },
        map(arg: any): any {
          return Effect.map(this as any, arg)
        }
      })
      // Object.defineProperty(effect, "andThen", {
      //   ...settings,
      //   value(arg: any) {
      //     return Effect.andThen(this, arg)
      //   }
      // })
      // Object.defineProperty(effect, "tap", {
      //   ...settings,
      //   value(arg: any) {
      //     return Effect.tap(this, arg)
      //   }
      // })
      // Object.defineProperty(effect, "map", {
      //   ...settings,
      //   value(arg: any) {
      //     return Effect.map(this, arg)
      //   }
      // })
    })

  const opt = Object.getPrototypeOf(Object.getPrototypeOf(Option.none()))
  Object.assign(opt, {
    andThen(arg: any): any {
      return Option.andThen(this as any, arg)
    },
    tap(arg: any): any {
      return Option.tap(this as any, arg)
    },
    map(arg: any): any {
      return Option.map(this as any, arg)
    },
    getOrElse(arg: () => any): any {
      return Option.getOrElse(this as any, arg)
    }
  })
  // Object.defineProperty(opt, "andThen", {
  //   ...settings,
  //   value(arg: any) {
  //     return Option.andThen(this, arg)
  //   }
  // })
  // Object.defineProperty(opt, "tap", {
  //   ...settings,
  //   value(arg: any) {
  //     return Option.tap(this, arg)
  //   }
  // })
  // Object.defineProperty(opt, "map", {
  //   ...settings,
  //   value(arg: any) {
  //     return Option.map(this, arg)
  //   }
  // })
  // Object
  //   .defineProperty(opt, "getOrElse", {
  //     ...settings,
  //     value(arg: () => any) {
  //       return Option.getOrElse(this, arg)
  //     }
  //   })

  const either = Object.getPrototypeOf(Object.getPrototypeOf(Either.left(1)))
  Object.assign(either, {
    andThen(arg: any): any {
      return Either.andThen(this as any, arg)
    },
    map(arg: any): any {
      return Either.map(this as any, arg)
    }
  })
  // Object.defineProperty(either, "andThen", {
  //   ...settings,
  //   value(arg: any) {
  //     return Either.andThen(this, arg)
  //   }
  // })
  // Object.defineProperty(either, "map", {
  //   ...settings,
  //   value(arg: any) {
  //     return Either.map(this, arg)
  //   }
  // })

  // built-ins
  // pipe on Object seems to interfeir with some libraries like undici
  Object
    .defineProperty(Array.prototype, "pipe", {
      ...settings,
      value(...args: [any, ...any[]]) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return pipe(this, ...args as [any])
      }
    })
  ;[Array.prototype, Map.prototype, Set.prototype]
    .forEach((proto) =>
      Object.defineProperty(proto, "forEachEffect", {
        ...settings,
        value(arg: () => any) {
          return Effect.forEach(this, arg)
        }
      })
    )

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

let patched = false

export function patch() {
  if (patched) {
    return
  }

  installFluentExtensions()

  patched = true
}

patch()

export {}

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
    andThen<E1, A, E2, B>(this: Either.Either<E1, A>, f: (a: A) => Either.Either<E2, B>): Either.Either<E1 | E2, B>
    andThen<E1, A, E2, B>(this: Either.Either<E1, A>, f: Either.Either<E2, B>): Either.Either<E1 | E2, B>
    map<E, A, B>(this: Either.Either<E, A>, f: (a: A) => B): Either.Either<E, B>
    get right(): A | undefined
  }
  export interface Right<out E, out A> {
    andThen<E1, A, E2, B>(this: Either.Either<E1, A>, f: (a: A) => Either.Either<E2, B>): Either.Either<E1 | E2, B>
    andThen<E1, A, E2, B>(this: Either.Either<E1, A>, f: Either.Either<E2, B>): Either.Either<E1 | E2, B>
    map<E, A, B>(this: Either.Either<E, A>, f: (a: A) => B): Either.Either<E, B>
    get left(): E | undefined
  }
}

declare global {
  // interface Iterable<T> {
  //   forEachEffect<A, R, E, B>(
  //     this: Iterable<A>,
  //     f: (a: A, i: number) => Effect.Effect<R, E, B>,
  //     options?: {
  //       readonly concurrency?: Concurrency | undefined
  //       readonly batching?: boolean | "inherit" | undefined
  //       readonly discard?: false | undefined
  //     }
  //   ): Effect.Effect<R, E, Array<B>>
  //   forEachEffect<A, R, E, B>(
  //     this: Iterable<A>,
  //     f: (a: A, i: number) => Effect.Effect<R, E, B>,
  //     options: {
  //       readonly concurrency?: Concurrency | undefined
  //       readonly batching?: boolean | "inherit" | undefined
  //       readonly discard: true
  //     }
  //   ): Effect.Effect<R, E, void>
  // }

  interface ReadonlyArray<T> {
    get toNonEmpty(): Option.Option<NonEmptyArray<T>>
    findFirstMap<A, B>(this: Iterable<A>, f: (a: A, i: number) => Option.Option<B>): Option.Option<B>
    findFirstMap<A, B extends A>(this: Iterable<A>, refinement: (a: A, i: number) => a is B): Option.Option<B>
    findFirstMap<A>(this: Iterable<A>, predicate: (a: A, i: number) => boolean): Option.Option<A>
    filterMap<A, B>(this: Iterable<A>, f: (a: A, i: number) => Option.Option<B>): Array<B>
    forEachEffect<A, R, E, B>(
      this: Iterable<A>,
      f: (a: A, i: number) => Effect.Effect<R, E, B>,
      options?: {
        readonly concurrency?: Concurrency | undefined
        readonly batching?: boolean | "inherit" | undefined
        readonly discard?: false | undefined
      }
    ): Effect.Effect<R, E, Array<B>>
    forEachEffect<A, R, E, B>(
      this: Iterable<A>,
      f: (a: A, i: number) => Effect.Effect<R, E, B>,
      options: {
        readonly concurrency?: Concurrency | undefined
        readonly batching?: boolean | "inherit" | undefined
        readonly discard: true
      }
    ): Effect.Effect<R, E, void>

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
  interface Array<T> {
    get toNonEmpty(): Option.Option<NonEmptyArray<T>>
    findFirstMap<A, B>(this: Iterable<A>, f: (a: A, i: number) => Option.Option<B>): Option.Option<B>
    findFirstMap<A, B extends A>(this: Iterable<A>, refinement: (a: A, i: number) => a is B): Option.Option<B>
    findFirstMap<A>(this: Iterable<A>, predicate: (a: A, i: number) => boolean): Option.Option<A>
    filterMap<A, B>(this: Iterable<A>, f: (a: A, i: number) => Option.Option<B>): Array<B>
    forEachEffect<A, R, E, B>(
      this: Iterable<A>,
      f: (a: A, i: number) => Effect.Effect<R, E, B>,
      options?: {
        readonly concurrency?: Concurrency | undefined
        readonly batching?: boolean | "inherit" | undefined
        readonly discard?: false | undefined
      }
    ): Effect.Effect<R, E, Array<B>>
    forEachEffect<A, R, E, B>(
      this: Iterable<A>,
      f: (a: A, i: number) => Effect.Effect<R, E, B>,
      options: {
        readonly concurrency?: Concurrency | undefined
        readonly batching?: boolean | "inherit" | undefined
        readonly discard: true
      }
    ): Effect.Effect<R, E, void>

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
  interface Set<T> {
    forEachEffect<A, R, E, B>(
      this: Iterable<A>,
      f: (a: A, i: number) => Effect.Effect<R, E, B>,
      options?: {
        readonly concurrency?: Concurrency | undefined
        readonly batching?: boolean | "inherit" | undefined
        readonly discard?: false | undefined
      }
    ): Effect.Effect<R, E, Array<B>>
    forEachEffect<A, R, E, B>(
      this: Iterable<A>,
      f: (a: A, i: number) => Effect.Effect<R, E, B>,
      options: {
        readonly concurrency?: Concurrency | undefined
        readonly batching?: boolean | "inherit" | undefined
        readonly discard: true
      }
    ): Effect.Effect<R, E, void>
  }
  interface ReadonlySet<T> {
    forEachEffect<A, R, E, B>(
      this: Iterable<A>,
      f: (a: A, i: number) => Effect.Effect<R, E, B>,
      options?: {
        readonly concurrency?: Concurrency | undefined
        readonly batching?: boolean | "inherit" | undefined
        readonly discard?: false | undefined
      }
    ): Effect.Effect<R, E, Array<B>>
    forEachEffect<A, R, E, B>(
      this: Iterable<A>,
      f: (a: A, i: number) => Effect.Effect<R, E, B>,
      options: {
        readonly concurrency?: Concurrency | undefined
        readonly batching?: boolean | "inherit" | undefined
        readonly discard: true
      }
    ): Effect.Effect<R, E, void>
  }
  interface Map<K, V> {
    forEachEffect<A, R, E, B>(
      this: Iterable<A>,
      f: (a: A, i: number) => Effect.Effect<R, E, B>,
      options?: {
        readonly concurrency?: Concurrency | undefined
        readonly batching?: boolean | "inherit" | undefined
        readonly discard?: false | undefined
      }
    ): Effect.Effect<R, E, Array<B>>
    forEachEffect<A, R, E, B>(
      this: Iterable<A>,
      f: (a: A, i: number) => Effect.Effect<R, E, B>,
      options: {
        readonly concurrency?: Concurrency | undefined
        readonly batching?: boolean | "inherit" | undefined
        readonly discard: true
      }
    ): Effect.Effect<R, E, void>
  }
  interface ReadonlyMap<K, V> {
    forEachEffect<A, R, E, B>(
      this: Iterable<A>,
      f: (a: A, i: number) => Effect.Effect<R, E, B>,
      options?: {
        readonly concurrency?: Concurrency | undefined
        readonly batching?: boolean | "inherit" | undefined
        readonly discard?: false | undefined
      }
    ): Effect.Effect<R, E, Array<B>>
    forEachEffect<A, R, E, B>(
      this: Iterable<A>,
      f: (a: A, i: number) => Effect.Effect<R, E, B>,
      options: {
        readonly concurrency?: Concurrency | undefined
        readonly batching?: boolean | "inherit" | undefined
        readonly discard: true
      }
    ): Effect.Effect<R, E, void>
  }
}

declare module "effect/Cause" {
  export interface YieldableError {
    andThen<A, R, E, X>(
      this: Effect.Effect<R, E, A>,
      f: (a: NoInfer<A>) => X
    ): [X] extends [Effect.Effect<infer R1, infer E1, infer A1>] ? Effect.Effect<R | R1, E | E1, A1>
      : [X] extends [Promise<infer A1>] ? Effect.Effect<R, UnknownException | E, A1>
      : Effect.Effect<R, E, X>

    andThen<A, R, E, X>(
      this: Effect.Effect<R, E, A>,
      f: X
    ): [X] extends [Effect.Effect<infer R1, infer E1, infer A1>] ? Effect.Effect<R | R1, E | E1, A1>
      : [X] extends [Promise<infer A1>] ? Effect.Effect<R, UnknownException | E, A1>
      : Effect.Effect<R, E, X>
    tap<A, R, E, X>(
      this: Effect.Effect<R, E, A>,
      f: (a: NoInfer<A>) => X
    ): [X] extends [Effect.Effect<infer R1, infer E1, infer _A1>] ? Effect.Effect<R | R1, E | E1, A>
      : [X] extends [Promise<infer _A1>] ? Effect.Effect<R, UnknownException | E, A>
      : Effect.Effect<R, E, A>
    tap<A, R, E, X>(
      this: Effect.Effect<R, E, A>,
      f: X
    ): [X] extends [Effect.Effect<infer R1, infer E1, infer _A1>] ? Effect.Effect<R | R1, E | E1, A>
      : [X] extends [Promise<infer _A1>] ? Effect.Effect<R, UnknownException | E, A>
      : Effect.Effect<R, E, A>
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
