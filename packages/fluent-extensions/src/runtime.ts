import * as RT from "effect/Runtime"
import type { Runtime } from "effect/Runtime"
import "./index.js"

/**
 * useful in e.g frontend projects that do not use tsplus, but still has the most useful extensions installed.
 */
export const installFluentRuntimeExtensions = <R>(runtime: Runtime<R>) => {
  const runPromise = RT.runPromise(runtime)
  const runFork = RT.runFork(runtime)
  const runSync = RT.runSync(runtime)
  Object.defineProperty(Object.prototype, "runPromise", {
    enumerable: false,
    configurable: true,
    get() {
      return runPromise(this)
    }
  })
  Object.defineProperty(Object.prototype, "runFork", {
    enumerable: false,
    configurable: true,
    value(arg: any) {
      return runFork(this, arg)
    }
  })
  Object.defineProperty(Object.prototype, "runSync", {
    enumerable: false,
    configurable: true,
    get() {
      return runSync(this)
    }
  })
}

// Put the following in the project, where RT is the default runtime context available
/*
declare module "effect/Effect" {
  export interface Effect<A, E, R> {
    // @ts-expect-error meh
    get runPromise(this: Effect<A, E, RT>): Promise<A>
    // @ts-expect-error meh
    get runSync(this: Effect<A, E, RT>): A
    runFork<A, E>(
      this: Effect<A, E, RT>,
      options?: Runtime.RunForkOptions,
    ): Fiber.RuntimeFiber<A, E>
  }
}

declare module "effect/Cause" {
  export interface YieldableError {
    // @ts-expect-error meh
    get runPromise(this: Effect<never, typeof this, RT>): Promise<never>
    // @ts-expect-error meh
    get runSync(this: Effect<never, typeof this, RT>): never
    runFork<A, E>(
      this: Effect<A, E, RT>,
      options?: Runtime.RunForkOptions,
    ): Fiber.RuntimeFiber<A, E>
  }
}
*/
