export type Service<T> = T extends Effect<infer S, any, any> ? S : T extends Tag<any, infer S> ? S : never
export type ServiceR<T> = T extends Effect<any, any, infer R> ? R : T extends Tag<infer R, any> ? R : never
export type ServiceE<T> = T extends Effect<any, infer E, any> ? E : never
export type Values<T> = T extends { [s: string]: infer S } ? Service<S> : never
export type ValuesR<T> = T extends { [s: string]: infer S } ? ServiceR<S> : never
export type ValuesE<T> = T extends { [s: string]: infer S } ? ServiceE<S> : never

/**
 * Due to tsplus unification (tsplus unify tag), when trying to use the Effect type in a type constraint
 * the compiler will cause basically anything to match. as such, use this type instead.
 * ```ts
 * const a = <
 *  SVC extends Record<
 *    string,
 *    ((req: number) => Effect<any, any, any>) | Effect<any, any, any>
 *   >
 * >(svc: SVC) => svc
 *
 * const b = a({ str: "" })   // valid, but shouldn't be!
 * ```
 */
export interface EffectUnunified<R, E, A> extends Effect<R, E, A> {}

export type LowerFirst<S extends PropertyKey> = S extends `${infer First}${infer Rest}` ? `${Lowercase<First>}${Rest}`
  : S
export type LowerServices<T extends Record<string, Tag<any, any> | Effect<any, any, any>>> = {
  [key in keyof T as LowerFirst<key>]: Service<T[key]>
}

/**
 * @tsplus static effect/io/Effect.Ops allLower
 */
export function allLower_<T extends Record<string, Tag<any, any> | Effect<any, any, any>>>(
  services: T
) {
  return Effect.all(
    services.$$.keys.reduce((prev, cur) => {
      const svc = services[cur]!
      prev[((cur as string)[0]!.toLowerCase() + (cur as string).slice(1)) as unknown as LowerFirst<typeof cur>] = svc // "_id" in svc && svc._id === TagTypeId ? svc : svc
      return prev
    }, {} as any),
    { concurrency: "inherit" }
  ) as any as Effect<LowerServices<T>, ValuesE<T>, ValuesR<T>>
}

/**
 * @tsplus static effect/io/Effect.Ops allLowerWith
 */
export function allLowerWith_<T extends Record<string, Tag<any, any> | Effect<any, any, any>>, A>(
  services: T,
  fn: (services: LowerServices<T>) => A
) {
  return allLower_(services).map(fn)
}

/**
 * @tsplus static effect/io/Effect.Ops allLowerWithEffect
 */
export function allLowerWithEffect_<T extends Record<string, Tag<any, any> | Effect<any, any, any>>, R, E, A>(
  services: T,
  fn: (services: LowerServices<T>) => Effect<A, E, R>
) {
  return allLower_(services).flatMap(fn)
}
