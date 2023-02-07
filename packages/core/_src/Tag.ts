// /**
//  * @tsplus fluent effect/data/Context/Tag withEffect_
//  */
// export function accessM_<T, R, E, A>(self: Tag<T>, f: (x: T) => Effect<R, E, A>) {
//   return Effect.serviceWithEffect(self)(f)
// }

// /**
//  * @tsplus fluent effect/data/Context/Tag with_
//  */
// export function access_<T, B>(self: Tag<T>, f: (x: T) => B) {
//   return Effect.serviceWith(self)(f)
// }

/**
 * @tsplus fluent effect/data/Context/Tag makeLayer
 */
export const makeLayer = Layer.succeed
