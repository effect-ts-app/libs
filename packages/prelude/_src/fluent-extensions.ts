import type * as Cause from "effect/Cause"
import * as Effect from "effect/Effect"
import * as RT from "effect/Runtime"
import type * as Runtime from "effect/Runtime"
import type { NoInfer } from "effect/Types"

/**
 * useful in e.g frontend projects that do not use tsplus, but still has the most useful extensions installed.
 */
export const installFluentExtensions = <R>(runtime: Runtime<R>) => {
  const runPromise = RT.runPromise(runtime)
  const runFork = RT.runFork(runtime)
  const runSync = RT.runSync(runtime)
  Object.defineProperty(Object.prototype, "runPromise", {
    enumerable: false,
    get() {
      return runPromise(this)
    }
  })
  Object.defineProperty(Object.prototype, "runFork", {
    enumerable: false,
    value(arg: any) {
      return runFork(this, arg)
    }
  })
  Object.defineProperty(Object.prototype, "runSync", {
    enumerable: false,
    get() {
      return runSync(this)
    }
  })
  Object.defineProperty(Object.prototype, "andThen", {
    enumerable: false,
    value(arg: any) {
      return Effect.andThen(this, arg)
    }
  })
  Object.defineProperty(Object.prototype, "tap", {
    enumerable: false,
    value(arg: any) {
      return Effect.tap(this, arg)
    }
  })
}

// Put the following in the project, where RT is the default runtime context available
/*
import type * as Runtime from "effect/Runtime"
import type * as Fiber from "effect/Fiber"
declare module "effect/Effect" {
  export interface Effect<R, E, A> {
    get runPromise(this: Effect<RT, E, A>): Promise<A>
    get runSync(this: Effect<RT, E, A>): A
    runFork<E, A>(this: Effect<RT, E, A>, options?: Runtime.RunForkOptions): Fiber.RuntimeFiber<E, A>
  }
}
*/

declare module "effect/Option" {
  export interface None<out A> {
    get value(): A | undefined
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
