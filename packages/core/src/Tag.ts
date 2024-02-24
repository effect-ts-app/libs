// /**
//  * @tsplus fluent effect/data/Context/Tag withEffect_
//  */
// export function accessM_<T, I, R, E, A>(self: Tag<T, I>, f: (x: T) => Effect<R, E, A>) {
//   return Effect.serviceWithEffect(self)(f)
// }

import { Layer } from "./Prelude.js"

// /**
//  * @tsplus fluent effect/data/Context/Tag with_
//  */
// export function access_<T, I, B>(self: Tag<T, I>, f: (x: T) => B) {
//   return Effect.serviceWith(self)(f)
// }

/**
 * @tsplus fluent effect/data/Context/Tag makeLayer
 */
export const makeLayer = Layer.succeed
