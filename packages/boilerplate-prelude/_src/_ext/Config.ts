import type * as Config from "@effect/io/Config"

/**
 * @tsplus fluent effect/io/Config withDefaultWhenMissing
 */
export function configWithDefaultWhenMissing<A>(config: Config.Config<A>, defaultValue: A) {
  return config
    .optional
    .map(_ => _.getOrElse(() => defaultValue))
}

/**
 * WARNING - If you need to use another Config provider make sure to pass in the appropriate runtime containing it.
 * @tsplus fluent effect/io/Config orElseWhenMissing
 */
export function configOrElseWhenMissing<A>(
  config: Config.Config<A>,
  defaultConfig: Config.Config<A>,
  runtime = Runtime.defaultRuntime
) {
  return config
    .optional
    .map(_ => _.getOrElse(() => runtime.unsafeRunSync(defaultConfig.config)))
  /**
  // return config
  //   .optional
  //   // flatMap doesn't exist
  //   .flatMap(_ => _.fold(() => defaultConfig, Config.succeed)
  //   .orElse(() => defaultConfig)
 */
}
