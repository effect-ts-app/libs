/**
 * @tsplus getter Tag get
 */
export function get<T>(self: Tag<T>) {
  return Effect.service(self)
}

/**
 * @tsplus getter Tag with
 */
export function with_<T>(self: Tag<T>) {
  return <B>(f: (x: T) => B) => Effect.serviceWith(self, f)
}

/**
 * @tsplus getter Tag withEffect
 */
export function accessM<T>(self: Tag<T>) {
  return <R, E, A>(f: (x: T) => Effect<R, E, A>) => Effect.serviceWithEffect(self, f)
}

/**
 * @tsplus fluent Tag withEffect_
 */
export function accessM_<T, R, E, A>(self: Tag<T>, f: (x: T) => Effect<R, E, A>) {
  return Effect.serviceWithEffect(self, f)
}

/**
 * @tsplus fluent Tag with_
 */
export function access_<T, B>(self: Tag<T>, f: (x: T) => B) {
  return Effect.serviceWith(self, f)
}
