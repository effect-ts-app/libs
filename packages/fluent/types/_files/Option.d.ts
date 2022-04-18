/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable import/no-duplicates */
// ets_tracing: off
import type { IO as EffectIO } from "@effect-ts/core/Effect"
import type { Option } from "@effect-ts/core/Option"
import type * as O from "@effect-ts/core/Option"
import type { IO as SyncIO } from "@effect-ts/core/Sync"

declare module "@effect-ts/system/Either/core" {
  export interface Left<E> {}
  export interface Right<A> {}
  export type Either<E, A> = Left<E> | Right<A>
}

declare module "@effect-ts/system/Option/core" {
  interface Ops<A> {
    /**
     * @ets_rewrite_getter toNullable from "@effect-ts/core/Option"
     */
    readonly val: A | null

    /**
     * @ets_rewrite_getter toUndefined from "@effect-ts/core/Option"
     */
    readonly value: A | undefined
  }
  /**
   * @tsplus type ets/Option/Some
   */
  export interface Some<A> extends Ops<A> {}

  /**
   * @tsplus type ets/Option/None
   */

  export interface None extends Ops<never> {}

  /**
   * @tsplus type ets/Option
   */
  export interface Option<A> {}

  export interface OptionOps {
    /**
     * @ets_rewrite_method alt_ from "@effect-ts-app/fluent/_ext/Option"
     */
    alt<A, B>(this: Option<A>, fb: () => Option<B>): Option<A | B>

    /**
     * @ets_rewrite_method tryCatchOption_ from "@effect-ts-app/core/Sync"
     */
    encaseInSync<E, A>(this: Option<A>, onNone: () => E): SyncIO<E, A>

    /**
     * @ets_rewrite_method encaseOption_ from "@effect-ts-app/core/Effect"
     */
    encaseInEffect<E, A>(this: Option<A>, onNone: () => E): EffectIO<E, A>
  }

  export interface OptionStaticOps {
    fromNullable: typeof O.fromNullable
    isSome: typeof O.isSome
    isNone: typeof O.isNone
  }
  const Option: OptionStaticOps
}
//# sourceMappingURL=option.d.ts.map
