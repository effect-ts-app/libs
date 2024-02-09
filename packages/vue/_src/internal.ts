import type { ApiConfig } from "@effect-app/prelude/client"
import type * as HttpClient from "@effect/platform/Http/Client"
import type { Runtime } from "effect/Runtime"

export const run = {
  value<E, A>(_: Effect<A, E, ApiConfig | HttpClient.Client.Default>): Promise<A> {
    throw new Error("Runtime not initialized, please run `initRuntime` first")
  }
}
export function initRuntime<A>(rt: Runtime<A | ApiConfig | HttpClient.Client.Default>) {
  run.value = function<E, A>(self: Effect<A, E, ApiConfig | HttpClient.Client.Default>): Promise<A> {
    return rt.runPromise(self)
  }
}
