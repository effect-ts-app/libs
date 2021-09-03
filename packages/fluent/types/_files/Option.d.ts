// ets_tracing: off
import type { IO as EffectIO } from "@effect-ts/core/Effect"
import type { Option } from "@effect-ts/core/Option"
import type { IO as SyncIO } from "@effect-ts/core/Sync"

export interface OptionOps<A> {
  // fix for bug in original
  /**
   * @ets_rewrite_method getOrElse_ from "@effect-ts/core/Option"
   */
  getOrElse<AX, B>(this: Option<AX>, f: () => B): AX | B

  /**
   * @ets_rewrite_method alt_ from "@effect-ts-app/fluent/_ext/Option"
   */
  alt<A, B>(this: Option<A>, fb: () => Option<B>): Option<A | B>

  /**
   * @ets_rewrite_getter toNullable from "@effect-ts/core/Option"
   */
  readonly val: A | null

  /**
   * @ets_rewrite_method tryCatchOption_ from "@effect-ts-app/core/Sync"
   */
  encaseInSync<E, A>(this: Option<A>, onNone: () => E): SyncIO<E, A>

  /**
   * @ets_rewrite_method encaseOption_ from "@effect-ts-app/core/Effect"
   */
  encaseInEffect<E, A>(this: Option<A>, onNone: () => E): EffectIO<E, A>
}

declare module "@effect-ts/system/Option/core" {
  interface Some<A> extends OptionOps<A> {}
  interface None extends OptionOps<never> {}
}
//# sourceMappingURL=option.d.ts.map
