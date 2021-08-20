import type * as T from "@effect-ts/core/Effect"
import type * as S from "@effect-ts/core/Sync"
import type { XPure } from "@effect-ts/system/XPure"

declare module "@effect-ts/system/Sync/core" {
  export interface Sync<R, E, A> extends XPure<unknown, unknown, unknown, R, E, A> {
    // Undo the selection for Effect for now.
    chain<RX, EX, AX, R2, E2, B>(
      this: S.Sync<RX, EX, AX>,
      f: (a: AX) => T.Effect<R2, E2, B>,
      __trace?: string
    ): never

    /**
     * @ets_rewrite_method map_ from "@effect-ts/core/Sync"
     */
    map<R, E, A, A2>(
      this: S.Sync<R, E, A>,
      f: (e: A) => A2,
      __trace?: string
    ): S.Sync<R, E, A2>

    /**
     * @ets_rewrite_method mapError_ from "@effect-ts/core/Sync"
     */
    mapError<R, E, E2, A>(
      this: S.Sync<R, E, A>,
      f: (e: E) => E2,
      __trace?: string
    ): S.Sync<R, E2, A>
  }
}
