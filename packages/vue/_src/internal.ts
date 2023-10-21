import type { ApiConfig } from "@effect-app/prelude/client"
import type { Runtime } from "effect/Runtime"

export const run = {
  value<E, A>(_: Effect<ApiConfig | HttpClient.Default, E, A>): Promise<A> {
    throw new Error("Runtime not initialized, please run `initRuntime` first")
  }
}
export function initRuntime<A>(rt: Runtime<A | ApiConfig | HttpClient.Default>) {
  run.value = function<E, A>(self: Effect<ApiConfig | HttpClient.Default, E, A>): Promise<A> {
    return rt.runPromise(self)
  }
}
