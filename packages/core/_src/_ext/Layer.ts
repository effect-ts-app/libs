import type { Effect, Layer } from "../Prelude.js"

/**
 * @tsplus unify Layer
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function unifyLayer<X extends Layer<any, any, any>>(
  self: X
): Layer<
  [X] extends [{ [Effect._RIn]: (_: infer RIn) => void }] ? RIn : never,
  [X] extends [{ [Effect._E]: () => infer E }] ? E : never,
  [X] extends [{ [Effect._ROut]: () => infer ROut }] ? ROut : never
> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return self
}
