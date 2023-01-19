import type { ApiConfig } from "@effect-app/prelude/client"
import type { Http } from "@effect-app/core/http/http-client"
import type { Runtime } from "@effect/io/Runtime"

export const run = {
  value<E, A>(_: Effect<ApiConfig | Http, E, A>): Promise<A> {
    throw new Error("Runtime not initialized, please run `initRuntime` first")
  }
}
export function initRuntime<A>(rt: Runtime<A | ApiConfig | Http>) {
  run.value = function<E, A>(self: Effect<ApiConfig | Http, E, A>): Promise<A> {
    return rt.unsafeRunPromise(self)
  }
}
