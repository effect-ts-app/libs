//import "./Lens.ext"
// import "./Schema.ext.js"

import "./Effect.js"
import "./EffectMaybe.js"
import "./Either.js"
import "./Layer.js"
import "./Managed.js"
import "./Maybe.js"
import "./Misc.js"
import "./RArray.js"
import "./Sync.js"
import "./XPure.js"

import { pipe } from "./pipe.js"

/**
 * @tsplus fluent ets/Effect pipe
 * @tsplus operator ets/Effect >=
 * @tsplus fluent ets/Effect apply
 * @tsplus fluent ets/Effect __call
 * @tsplus fluent ets/Managed pipe
 * @tsplus operator ets/Managed >=
 * @tsplus fluent ets/Managed apply
 * @tsplus fluent ets/Managed __call
 * @tsplus fluent ets/Sync pipe
 * @tsplus operator ets/Sync >=
 * @tsplus fluent ets/Sync apply
 * @tsplus fluent ets/Sync __call
 * @tsplus macro pipe
 */
export const pipeEffect = pipe

/**
 * @tsplus fluent ets/Sync zipRightS
 * @deprecated fix by replacing legacy effect-ts/fluent, and dropping 'S' suffix
 */
export const syncZipRight = <RX, EX, AX, R2, E2, B>(
  self: Sync<RX, EX, AX>,
  f: Sync<R2, E2, B>
): Sync<RX & R2, EX | E2, B> => {
  return self.flatMap((_) => f)
}

/**
 * @tsplus fluent ets/Sync tapS
 * @deprecated fix by replacing legacy effect-ts/fluent, and dropping 'S' suffix
 */
export const syncTap = <RX, EX, AX, R2, E2, B>(
  self: Sync<RX, EX, AX>,
  f: (a: AX) => Sync<R2, E2, B>
): Sync<RX & R2, EX | E2, AX> => {
  return self.flatMap((_) => f(_).map(() => _))
}

/**
 * @tsplus getter ets/Sync asEffect
 */
export const { toEffect } = Sync

/**
 * @tsplus fluent ets/Either fold
 */
export const eitherFold = Either.fold_

/**
 * @tsplus fluent ets/Effect injectSomeFIX
 */
export const effectInjectSome = Effect.provide_

/**
 * @tsplus fluent ets/Sync getOrFailM
 */
export function getOrFailM<R, R2, E, E2, E3, A>(
  self: SyncMaybe<R, E, A>,
  onNone: () => Sync<R2, E3, E2>
): Sync<R & R2, E | E2 | E3, A> {
  return self.flatMap((_) => _.fold(() => onNone().flatMap(Sync.fail), Sync.succeed))
}
