/**
 * @tsplus fluent effect/io/Effect instrument
 */
export function instr<R, E, A>(self: Effect<R, E, A>, name: string, properties?: Record<string, string>) {
  return self
    .zipLeft(Effect.logTrace(`instrumented`))
    .withSpan(name, { attributes: properties })
    .withLogSpan(name)

  // trackMetric(name, time, properties))
}
