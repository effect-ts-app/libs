import { ApiConfig } from "@effect-app/prelude/client"
import * as Scope from "effect/Scope"
import { initRuntime } from "./internal.js"

import * as HttpClientBrowser from "@effect/platform-browser/HttpClient"

export { initRuntime } from "./internal.js"

export const DefaultApiConfig = Config.all({
  apiUrl: Config.string("apiUrl").withDefault("/api"),
  headers: Config
    .string()
    .hashMap("headers")
    .option
})

export function makeApiLayers(config: ApiConfig) {
  return HttpClientBrowser
    .client
    .layer
    .merge(ApiConfig.layer(config))
}

export function makeAppRuntime<R, E, A>(layer: Layer<R, E, A>) {
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

export function initializeSync<E, A>(layer: Layer<never, E, A | ApiConfig | HttpClient.Default>) {
  const { clean, runtime } = makeAppRuntime(layer).runSync
  initRuntime(runtime)
  return {
    runtime,
    clean: () => clean.runSync
  }
}

export function initializeAsync<E, A>(layer: Layer<never, E, A | ApiConfig | HttpClient.Default>) {
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
