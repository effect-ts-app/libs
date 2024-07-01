import type * as HttpClient from "@effect/platform/HttpClient"
import type { Effect } from "effect-app"
import { pipe, Runtime } from "effect-app"
import type { ApiConfig } from "effect-app/client"
import { reportError } from "./errorReporter.js"

export const run = {
  value<E, A>(
    _: Effect<A, E, ApiConfig | HttpClient.HttpClient.Default>,
    _options?: { readonly signal?: AbortSignal } | undefined
  ): Promise<A> {
    throw new Error("Runtime not initialized, please run `initRuntime` first")
  }
}
export const reportRuntimeError = reportError("Runtime")
export function initRuntime<A>(rt: Runtime.Runtime<A | ApiConfig | HttpClient.HttpClient.Default>) {
  const runPromise = Runtime.runPromise(rt)
  run.value = function<E, A>(
    self: Effect<A, E, ApiConfig | HttpClient.HttpClient.Default>,
    options?: { readonly signal?: AbortSignal } | undefined
  ): Promise<A> {
    return runPromise(
      self,
      options
    )
  }
}

// $Project/$Configuration.Index
// -> "$Project", "$Configuration", "Index"
export const makeQueryKey = (name: string) =>
  pipe(name.split("/"), (split) => split.map((_) => "$" + _))
    .join(".")
    .split(".")
