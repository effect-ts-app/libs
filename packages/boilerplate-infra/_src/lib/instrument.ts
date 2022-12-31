/**
 * @tsplus fluent effect/io/Effect instrument
 */
export function instr<R, E, A>(self: Effect<R, E, A>, name: string, properties?: Record<string, string>) {
  return self
    .tap(() => Effect.logDebug(`instrumented`).logAnnotate("properties", (properties || {}).$$.pretty))
    .withSpan(name)
  // trackMetric(name, time, properties))
}
