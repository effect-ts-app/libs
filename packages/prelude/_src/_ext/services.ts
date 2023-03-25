type Service<T> = T extends Tag<infer S> ? S : never
type Values<T> = T extends { [s: string]: infer S } ? Service<S> : never
type LowerFirst<S extends PropertyKey> = S extends `${infer First}${infer Rest}` ? `${Lowercase<First>}${Rest}` : S
type LowerServices<T extends Record<string, Tag<any>>> = { [key in keyof T as LowerFirst<key>]: Service<T[key]> }

/**
 * @tsplus static effect/io/Effect.Ops services
 */
export function accessLowerServices_<T extends Record<string, Tag<any>>>(
  services: T
) {
  return Effect.all(
    services.$$.keys.reduce((prev, cur) => {
      prev[((cur as string)[0]!.toLowerCase() + (cur as string).slice(1)) as unknown as LowerFirst<typeof cur>] = Effect
        .service(services[cur]!)
      return prev
    }, {} as any)
  ) as any as Effect<Values<T>, never, LowerServices<T>>
}

/**
 * @tsplus static effect/io/Effect.Ops servicesWith
 */
export function accessLowerServicesWith_<T extends Record<string, Tag<any>>, A>(
  services: T,
  fn: (services: LowerServices<T>) => A
) {
  return Debug.untraced(() => accessLowerServices_(services).map(fn))
}

/**
 * @tsplus static effect/io/Effect.Ops servicesWithEffect
 */
export function accessLowerServicesWithEffect_<T extends Record<string, Tag<any>>, R, E, A>(
  services: T,
  fn: (services: LowerServices<T>) => Effect<R, E, A>
) {
  return Debug.untraced(() => accessLowerServices_(services).flatMap(fn))
}
