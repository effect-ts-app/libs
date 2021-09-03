// ets_tracing: off
import type { Option } from "@effect-ts/core/Option"

export interface OptionOps<A> {
  /**
   * @ets_rewrite_method alt_ from "@effect-ts-app/fluent/_ext/Option"
   */
  alt<A, B>(this: Option<A>, fb: () => Option<B>): Option<A | B>

  /**
   * @ets_rewrite_getter toNullable from "@effect-ts/core/Option"
   */
  readonly val: A | null
}

declare module "@effect-ts/system/Option/core" {
  interface Some<A> extends OptionOps<A> {}
  interface None extends OptionOps<never> {}
}
//# sourceMappingURL=option.d.ts.map
