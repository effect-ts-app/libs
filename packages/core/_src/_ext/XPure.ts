import type { Effect, XPure } from "../Prelude.js"
import { pipe } from "./pipe.js"

/**
 * @tsplus operator ets/XPure >=
 * @tsplus fluent ets/XPure apply
 * @tsplus fluent ets/XPure __call
 * @tsplus macro pipe
 */
export const pipeXPure = pipe

// // NOTE: unify functions only work if the @tsplus type tag is on the original definition, not on prelude's definitions.
/**
 * @tsplus unify ets/XPure
 */
export function unifyXPure<X extends XPure<any, any, any, any, any, any>>(
  self: X
): XPure<
  [X] extends [{ [Effect._W]: () => infer W }] ? W : never,
  [X] extends [{ [Effect._S1]: (_: infer S1) => void }] ? S1 : never,
  [X] extends [{ [Effect._S2]: () => infer S2 }] ? S2 : never,
  [X] extends [{ [Effect._R]: (_: infer R) => void }] ? R : never,
  [X] extends [{ [Effect._E]: () => infer E }] ? E : never,
  [X] extends [{ [Effect._A]: () => infer A }] ? A : never
> {
  return self
}
