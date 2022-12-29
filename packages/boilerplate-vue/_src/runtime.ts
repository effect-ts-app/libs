import { ApiConfig } from "@effect-ts-app/boilerplate-prelude/client"
import type { Http } from "@effect-ts-app/core/http/http-client"
import * as HF from "@effect-ts-app/core/http/http-client-fetch"
import { fetch } from "cross-fetch"
import { initRuntime } from "./internal.js"

export { initRuntime } from "./internal.js"

export function makeApiLayers(apiUrl = "/api") {
  return HF.Client(fetch) + ApiConfig.Live({ apiUrl })
}

export function makeAppRuntime<R, E, A>(layer: Layer<R, E, A>) {
  return Effect.gen(function*($) {
    const scope = yield* $(Scope.make())
    const env = yield* $(layer.buildWithScope(scope))
    const runtime = yield* $(Effect.runtime<A>().scoped.provideEnvironment(env))

    return {
      runtime,
      clean: scope.close(Exit.unit)
    }
  })
}

export function initializeSync<E, A>(layer: Layer<never, E, A | ApiConfig | Http>) {
  const { clean, runtime } = makeAppRuntime(layer).unsafeRunSync()
  initRuntime(runtime)
  return {
    runtime,
    clean: () => clean.unsafeRunSync()
  }
}

export function initializeAsync<E, A>(layer: Layer<never, E, A | ApiConfig | Http>) {
  return makeAppRuntime(layer).unsafeRunPromise()
    .then(({ clean, runtime }) => {
      initRuntime(runtime)
      return {
        runtime,
        clean: () => clean.unsafeRunPromise()
      }
    })
}
