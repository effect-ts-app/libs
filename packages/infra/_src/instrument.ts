/**
 * @tsplus fluent effect/io/Effect instrument
 */
export function instr<R, E, A>(self: Effect<R, E, A>, name: string, properties?: Record<string, string>) {
  return self
    .tap(() => Effect.logDebug(`instrumented`).annotateLogs("properties", (properties || {}).$$.pretty))
    .withSpan(name)
    .withLogSpan(name)

  // trackMetric(name, time, properties))
}
