import { ApiConfig } from "@effect-app/prelude/client"
import * as Scope from "effect/Scope"
import { initRuntime } from "./internal.js"

import * as HttpClient from "@effect/platform/Http/Client"

export { initRuntime } from "./internal.js"

export const DefaultApiConfig = Config.all({
  apiUrl: Config.string("apiUrl").withDefault("/api"),
  headers: Config
    .string()
    .hashMap("headers")
    .option
})

export function makeApiLayers(config: ApiConfig) {
  return HttpClient
    .layer
    .merge(ApiConfig.layer(config))
}

export function makeAppRuntime<R, E, A>(layer: Layer<A, E, R>) {
  return Effect.gen(function*($) {
    const scope = yield* $(Scope.make())
    const env = yield* $(layer.buildWithScope(scope))
    const runtime = yield* $(Effect.runtime<A>().scoped.provide(env))

    return {
      runtime,
      clean: scope.close(Exit.unit)
    }
  })
}

export function initializeSync<E, A>(layer: Layer<A | ApiConfig | HttpClient.Client.Default, E, never>) {
  const { clean, runtime } = makeAppRuntime(layer).runSync
  initRuntime(runtime)
  return {
    runtime,
    clean: () => clean.runSync
  }
}

export function initializeAsync<E, A>(layer: Layer<A | ApiConfig | HttpClient.Client.Default, E, never>) {
  return makeAppRuntime(layer)
    .runPromise
    .then(({ clean, runtime }) => {
      initRuntime(runtime)
      return {
        runtime,
        clean: () => clean.runPromise
      }
    })
}
