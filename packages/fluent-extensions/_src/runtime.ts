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
import type * as Runtime from "effect/Runtime"
import type * as Fiber from "effect/Fiber"
import type { RT } from "./effect-runtime"

declare module "effect/Effect" {
  export interface Effect<R, E, A> {
    get runPromise(this: Effect<RT, E, A>): Promise<A>
    get runSync(this: Effect<RT, E, A>): A
    runFork<E, A>(
      this: Effect<RT, E, A>,
      options?: Runtime.RunForkOptions,
    ): Fiber.RuntimeFiber<E, A>
  }
}
*/
