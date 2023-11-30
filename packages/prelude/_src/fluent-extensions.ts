import type {} from "./fluent-extensions-ext.js"
import * as Effect from "effect/Effect"
import * as RT from "effect/Runtime"

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
