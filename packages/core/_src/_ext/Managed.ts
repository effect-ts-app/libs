import { Effect, Managed } from "@effect-ts-app/core/Prelude"

/**
 * A variant of `flatMap` that ignores the value produced by this effect.
 *
 * @tsplus fluent ets/Managed zipRight
 * @tsplus operator ets/Managed >
 */
export function managedZipRight_<R, E, A, R2, E2, A2>(
  a: Managed<R, E, A>,
  b: Managed<R2, E2, A2>
): Managed<R & R2, E | E2, A2> {
  return Managed.zipRight_(a, b)
}

/**
 * @tsplus unify ets/Managed
 */
export function unifyManaged<X extends Managed<any, any, any>>(
  self: X
): Managed<
  [X] extends [{ [Effect._R]: (_: infer R) => void }] ? R : never,
  [X] extends [{ [Effect._E]: () => infer E }] ? E : never,
  [X] extends [{ [Effect._A]: () => infer A }] ? A : never
> {
  return self
}
