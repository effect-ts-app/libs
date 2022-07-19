// ets_tracing: off

import { chain_, provideAll_, provideSome } from "@effect-ts/core/Sync"
import { catchTag_, Erase } from "@effect-ts-app/core/Effect.js"

/**
 * @tsplus fluent ets/Sync flatMap
 */
export const ext_chain_ = chain_

/**
 * @tsplus fluent ets/Sync injectAll
 * @tsplus fluent ets/Sync injectEnv
 */
export const ext_provideAll_ = provideAll_

/**
 * @tsplus static ets/Sync.Ops provideSome
 * @tsplus fluent ets/Sync injectSome
 */
export const ext_provideSome_ = <R0, R1, E, A>(
  self: Sync<R1, E, A>,
  f: (s: R0) => R1
) => provideSome(f)(self)

// /**
//  * Provides the service with the required Service Entry
//  */
// export function provideServiceM_<T>(_: Tag<T>) {
//   return <R, E>(f: X.Sync<R, E, T>) =>
//     <R1, E1, A1>(ma: X.Sync<R1 & Has<T>, E1, A1>): X.Sync<R & R1, E | E1, A1> =>
//       X.accessM((r: R & R1) =>
//         X.chain_(f, (t) => X.provideAll_(ma, mergeEnvironments(_, r, t)))
//       )
// }

// /**
//  * Provides the service with the required Service Entry
//  */
// export function provideService_<T>(_: Tag<T>) {
//   return (f: T) =>
//     <R1, E1, A1>(ma: X.Sync<R1 & Has<T>, E1, A1>): X.Sync<R1, E1, A1> =>
//       provideServiceM(_)(X.succeed(f))(ma)
// }

// /**
//  * @tsplus fluent ets/Sync injectService
//  */
// export const ext_provideService_ = provideService_

// /**
//  * @tsplus fluent ets/Sync injectServiceM
//  */
// export const ext_provideServiceM_ = provideServiceM_

/**
 * @tsplus fluent ets/Sync inject
 */
export const ext_inject_ = <RX, EX, AX, R2, E2, A2>(
  self: Sync<RX, EX, AX>,
  layer: Layer<R2, E2, A2>
): Effect<Erase<RX, A2> & R2, EX | E2, AX> =>
  Effect.provideSomeLayer_(self as any, layer)

/**
 * @tsplus fluent ets/Sync catchTag
 */
export const ext_catchTag_ = catchTag_
