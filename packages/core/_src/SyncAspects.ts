import { mapError, Sync } from "@effect-ts/core/Sync"

import * as T from "./Effect.js"
import { identity } from "./Function.js"

export * from "@effect-ts/core/Sync"

export const orDie = mapError((err) => {
  throw err
})

export function toEffect<R, E, A>(self: Sync<R, E, A>): Effect<R, E, A> {
  return T.map_(self, identity)
}
