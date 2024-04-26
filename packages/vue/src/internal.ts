import type * as HttpClient from "@effect/platform/Http/Client"
import { Effect, pipe, Runtime } from "effect-app"
import type { ApiConfig } from "effect-app/client"
import { reportError } from "./errorReporter.js"

export const run = {
  value<E, A>(
    _: Effect<A, E, ApiConfig | HttpClient.Client.Default>,
    _options?: { readonly signal?: AbortSignal } | undefined
  ): Promise<A> {
    throw new Error("Runtime not initialized, please run `initRuntime` first")
  }
}
const reportRuntimeError = reportError("Runtime")
export function initRuntime<A>(rt: Runtime.Runtime<A | ApiConfig | HttpClient.Client.Default>) {
  const runPromise = Runtime.runPromise(rt)
  run.value = function<E, A>(
    self: Effect<A, E, ApiConfig | HttpClient.Client.Default>,
    options?: { readonly signal?: AbortSignal } | undefined
  ): Promise<A> {
    return runPromise(
      self.pipe(
        Effect.catchAllCause((cause) =>
          reportRuntimeError(cause)
            .pipe(Effect.andThen(Effect.die))
        )
      ),
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
