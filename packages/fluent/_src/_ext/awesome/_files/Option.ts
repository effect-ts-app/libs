/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable import/no-duplicates */
// ets_tracing: off
import type { IO as EffectIO } from "@effect-ts/core/Effect"
import type { Option } from "@effect-ts/core/Option"
import type * as O from "@effect-ts/core/Option"
import type { IO as SyncIO } from "@effect-ts/core/Sync"

declare module "@effect-ts/system/Either/core" {
  /**
   * @tsplus type ets/Either/Left
   */
  export interface Left<E> {}
  /**
   * @tsplus type ets/Either/Right
   */
  export interface Right<A> {}

  // /**
  //  * @tsplus type ets/Either
  //  */
  // export type Either<E, A> = Left<E> | Right<A>
}

declare module "@effect-ts/system/Option/core" {
  interface Ops<A> {
import { toNullable } from "@effect-ts/core/Option"

/**
 * @tsplus getter ets/Option val
 */
export const ext_toNullable = toNullable

import { toUndefined } from "@effect-ts/core/Option"

/**
 * @tsplus getter ets/Option value
 */
export const ext_toUndefined = toUndefined

  /**
   * @tsplus type ets/Option/None
   */

  export interface None extends Ops<never> {}

  // /**
  //  * @tsplus type ets/Option
  //  */
  // export interface Option<A> {}

  export interface OptionOps {
import { alt_ } from "@effect-ts-app/fluent/_ext/Option"

/**
 * @tsplus fluent ets/Option alt
 */
export const ext_alt_ = alt_

import { tryCatchOption_ } from "@effect-ts-app/core/Sync"

/**
 * @tsplus fluent ets/Sync encaseInSync
 */
export const ext_tryCatchOption_ = tryCatchOption_

import { encaseOption_ } from "@effect-ts-app/core/Effect"

/**
 * @tsplus fluent ets/Effect encaseInEffect
 */
export const ext_encaseOption_ = encaseOption_

  export interface OptionStaticOps {
    fromNullable: typeof O.fromNullable
    isSome: typeof O.isSome
    isNone: typeof O.isNone
  }
  const Option: OptionStaticOps
}
//# sourceMappingURL=option.d.ts.map
