/**
 * @tsplus getter fp-ts/data/Context.Tag get
 */
export function get<T>(self: Tag<T>) {
  return Effect.service(self)
}

/**
 * @tsplus getter fp-ts/data/Context.Tag with
 */
export const with_ = Effect.serviceWith

/**
 * @tsplus getter fp-ts/data/Context.Tag withEffect
 */
export const withEffect = Effect.serviceWithEffect

/**
 * @tsplus fluent fp-ts/data/Context.Tag withEffect_
 */
export function accessM_<T, R, E, A>(self: Tag<T>, f: (x: T) => Effect<R, E, A>) {
  return Effect.serviceWithEffect(self)(f)
}

/**
 * @tsplus fluent fp-ts/data/Context.Tag with_
 */
export function access_<T, B>(self: Tag<T>, f: (x: T) => B) {
  return Effect.serviceWith(self)(f)
}
