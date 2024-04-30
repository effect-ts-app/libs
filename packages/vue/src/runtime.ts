import * as HttpClient from "@effect/platform/Http/Client"
import { Config, Exit, Runtime } from "effect"
import { Effect, Layer, Logger } from "effect-app"
import { ApiConfig } from "effect-app/client"
import * as Scope from "effect/Scope"
import { initRuntime } from "./internal.js"

export { initRuntime } from "./internal.js"

export const DefaultApiConfig = Config.all({
  apiUrl: Config.string("apiUrl").pipe(Config.withDefault("/api")),
  headers: Config
    .hashMap(
      Config.string(),
      "headers"
    )
    .pipe(Config.option)
})

export function makeApiLayers(config: ApiConfig) {
  return HttpClient
    .layer
    .pipe(Layer
      .merge(ApiConfig.layer(config)))
}

export function makeAppRuntime<R, E, A>(layer: Layer<A, E, R>) {
  return Effect.gen(function*($) {
    layer = layer.pipe(
      Layer.provide(Logger.replace(Logger.defaultLogger, Logger.withSpanAnnotations(Logger.structuredLogger)))
    )
    const scope = yield* $(Scope.make())
    const env = yield* $(layer.pipe(Layer.buildWithScope(scope)))
    const runtime = yield* $(Effect.runtime<A>().pipe(Effect.scoped, Effect.provide(env)))

    return {
      runtime: Object.assign(runtime, {
        runPromise: Runtime.runPromise(runtime),
        runPromiseExit: Runtime.runPromiseExit(runtime),
        runSync: Runtime.runSync(runtime),
        runSyncExit: Runtime.runSyncExit(runtime),
        runFork: Runtime.runFork(runtime)
      }),
      clean: Scope.close(scope, Exit.void)
    }
  })
}

export function initializeSync<E, A>(layer: Layer<A | ApiConfig | HttpClient.Client.Default, E, never>) {
  const { clean, runtime } = Effect.runSync(makeAppRuntime(layer))
  initRuntime(runtime)
  return {
    runtime,
    clean: () => Effect.runSync(clean)
  }
}

export function initializeAsync<E, A>(layer: Layer<A | ApiConfig | HttpClient.Client.Default, E, never>) {
  return Effect
    .runPromise(makeAppRuntime(layer))
    .then(({ clean, runtime }) => {
      initRuntime(runtime)
      return {
        runtime,
        clean: () => Effect.runPromise(clean)
      }
    })
}
