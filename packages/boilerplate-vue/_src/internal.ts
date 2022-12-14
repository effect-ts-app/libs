import type { ApiConfig } from "@effect-ts-app/boilerplate-prelude/client"
import type { Http } from "@effect-ts-app/core/http/http-client"

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
