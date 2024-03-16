/* eslint-disable @typescript-eslint/no-explicit-any */
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
    value(...args: any[]) {
      return runPromise(this, ...args)
    }
  })
  Object.defineProperty(Object.prototype, "runFork", {
    enumerable: false,
    configurable: true,
    value(...args: any[]) {
      return runFork(this, ...args)
    }
  })
  Object.defineProperty(Object.prototype, "runSync", {
    enumerable: false,
    configurable: true,
    value() {
      return runSync(this)
    }
  })
}

// Put the following in the project, where RT is the default runtime context available
/*
declare module "effect/Effect" {
  export interface Effect<A, E, R> {
    runPromise<A, E>(this: Effect<A, E, RT>, options?: { readonly signal?: AbortSignal } | undefined): Promise<A>
    runSync<A, E>(this: Effect<A, E, RT>): A
    runFork<A, E>(
      this: Effect<A, E, RT>,
      options?: Runtime.RunForkOptions
    ): Fiber.RuntimeFiber<A, E>
  }
}

declare module "effect/Cause" {
  export interface YieldableError {
    runPromise(
      // @ts-expect-error meh
      this: Effect<never, typeof this, RT>,
      options?: { readonly signal?: AbortSignal } | undefined
    ): Promise<never>
    // @ts-expect-error meh
    runSync(this: Effect<never, typeof this, RT>): never
    runFork(
      // @ts-expect-error meh
      this: Effect<never, typeof this, RT>,
      options?: Runtime.RunForkOptions
    ): Fiber.RuntimeFiber<never, typeof this>
  }
}
*/
