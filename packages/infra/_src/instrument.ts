/**
 * @tsplus fluent effect/io/Effect instrument
 */
export function instr<R, E, A>(self: Effect<R, E, A>, name: string, properties?: Record<string, string>) {
  return Debug.untraced(() =>
    self
      .tap(() => Effect.logDebug(`instrumented`).logAnnotate("properties", (properties || {}).$$.pretty))
      .logSpan(name)
  )
  // trackMetric(name, time, properties))
}
