import { TagTypeId } from "@effect-app/prelude/service"

export type Service<T> = T extends Effect<any, any, infer S> ? S : T extends Tag<infer S> ? S : never
export type ServiceR<T> = T extends Effect<infer R, any, any> ? R : T extends Tag<infer S> ? S : never
export type Values<T> = T extends { [s: string]: infer S } ? Service<S> : never
export type ValuesR<T> = T extends { [s: string]: infer S } ? ServiceR<S> : never

export type LowerFirst<S extends PropertyKey> = S extends `${infer First}${infer Rest}` ? `${Lowercase<First>}${Rest}`
  : S
export type LowerServices<T extends Record<string, Tag<any> | Effect<any, any, any>>> = {
  [key in keyof T as LowerFirst<key>]: Service<T[key]>
}

/**
 * @tsplus static effect/io/Effect.Ops servicesOrEffects
 */
export function accessLowerServicesOrEffects_<T extends Record<string, Tag<any> | Effect<any, any, any>>>(
  services: T
) {
  return Effect.all(
    services.$$.keys.reduce((prev, cur) => {
      const svc = services[cur]!
      prev[((cur as string)[0]!.toLowerCase() + (cur as string).slice(1)) as unknown as LowerFirst<typeof cur>] =
        "_id" in svc && svc._id === TagTypeId ? Effect.service(svc) : services[cur]
      return prev
    }, {} as any)
  ) as any as Effect<ValuesR<T>, never, LowerServices<T>>
}

/**
 * @tsplus static effect/io/Effect.Ops servicesOrEffectsWith
 */
export function accessLowerServicesAndEffects_<T extends Record<string, Tag<any> | Effect<any, any, any>>, A>(
  services: T,
  fn: (services: LowerServices<T>) => A
) {
  return Debug.untraced(() => accessLowerServicesOrEffects_(services).map(fn))
}
