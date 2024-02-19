import type * as HttpClient from "@effect/platform/Http/Client"
import type { Effect } from "effect-app"
import { pipe, Runtime } from "effect-app"
import type { ApiConfig } from "effect-app/client"

export const run = {
  value<E, A>(_: Effect<A, E, ApiConfig | HttpClient.Client.Default>): Promise<A> {
    throw new Error("Runtime not initialized, please run `initRuntime` first")
  }
}
export function initRuntime<A>(rt: Runtime.Runtime<A | ApiConfig | HttpClient.Client.Default>) {
  const runPromise = Runtime.runPromise(rt)
  run.value = function<E, A>(self: Effect<A, E, ApiConfig | HttpClient.Client.Default>): Promise<A> {
    return runPromise(self)
  }
}

// $Project/$Configuration.Index
// -> "$Project", "$Configuration", "Index"
export const makeQueryKey = (name: string) =>
  pipe(name.split("/"), (split) => split.map((_) => "$" + _))
    .join(".")
    .split(".")
