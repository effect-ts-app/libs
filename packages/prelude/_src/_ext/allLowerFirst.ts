export type Service<T> = T extends Effect<any, any, infer S> ? S : T extends Tag<any, infer S> ? S : never
export type ServiceR<T> = T extends Effect<infer R, any, any> ? R : T extends Tag<any, infer S> ? S : never
export type ServiceE<T> = T extends Effect<any, infer E, any> ? E : never
export type Values<T> = T extends { [s: string]: infer S } ? Service<S> : never
export type ValuesR<T> = T extends { [s: string]: infer S } ? ServiceR<S> : never
export type ValuesE<T> = T extends { [s: string]: infer S } ? ServiceE<S> : never

export type LowerFirst<S extends PropertyKey> = S extends `${infer First}${infer Rest}` ? `${Lowercase<First>}${Rest}`
  : S
export type LowerServices<T extends Record<string, Tag<any, any> | Effect<any, any, any>>> = {
  [key in keyof T as LowerFirst<key>]: Service<T[key]>
}

/**
 * @tsplus static effect/io/Effect.Ops allLowerFirst
 */
export function allLowerFirst_<T extends Record<string, Tag<any, any> | Effect<any, any, any>>>(
  services: T
) {
  return Effect.all(
    services.$$.keys.reduce((prev, cur) => {
      const svc = services[cur]!
      prev[((cur as string)[0]!.toLowerCase() + (cur as string).slice(1)) as unknown as LowerFirst<typeof cur>] = svc // "_id" in svc && svc._id === TagTypeId ? svc : svc
      return prev
    }, {} as any),
    { concurrency: "inherit" }
  ) as any as Effect<ValuesR<T>, ValuesE<T>, LowerServices<T>>
}

/**
 * @tsplus static effect/io/Effect.Ops allLowerFirstWith
 */
export function allLowerFirstWith_<T extends Record<string, Tag<any, any> | Effect<any, any, any>>, A>(
  services: T,
  fn: (services: LowerServices<T>) => A
) {
  return allLowerFirst_(services).map(fn)
}

/**
 * @tsplus static effect/io/Effect.Ops allLowerFirstWithEffect
 */
export function allLowerFirstWithEffect_<T extends Record<string, Tag<any, any> | Effect<any, any, any>>, R, E, A>(
  services: T,
  fn: (services: LowerServices<T>) => Effect<R, E, A>
) {
  return allLowerFirst_(services).flatMap(fn)
}
