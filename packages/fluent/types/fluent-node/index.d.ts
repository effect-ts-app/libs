// ets_tracing: off

import type * as T from "@effect-ts/core/Effect"

declare module "@effect-ts/system/Effect/effect" {
  export interface Effect<R, E, A> {
    /**
     * @ets_rewrite_method runMain from "@effect-ts/node/Runtime"
     */
    runMain<EX, AX>(this: T.Effect<T.DefaultEnv, EX, AX>): void
  }
}
