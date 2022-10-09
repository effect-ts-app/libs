import { ifDiff_, tapBothInclAbort_, tapErrorInclAbort_ } from "./EffectBase.js"

export const tapBothInclAbort =
  <A, ER, EE, EA, SR, SE, SA>(
    onError: (err: unknown) => Effect<ER, EE, EA>,
    onSuccess: (a: A) => Effect<SR, SE, SA>
  ) =>
  <R, E>(eff: Effect<R, E, A>) =>
    tapBothInclAbort_(eff, onError, onSuccess)

export const tapErrorInclAbort =
  <A, ER, EE, EA>(onError: (err: unknown) => Effect<ER, EE, EA>) =>
  <R, E>(eff: Effect<R, E, A>) =>
    tapErrorInclAbort_(eff, onError)

export function ifDiff<I, R, E, A>(n: I, orig: I) {
  return (f: (i: I) => Effect<R, E, A>) => ifDiff_(n, orig, f)
}
