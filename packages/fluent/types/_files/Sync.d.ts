import type { Effect } from "@effect-ts/core/Effect"
import type { XPure } from "@effect-ts/system/XPure"
import type { SyncOption } from "@effect-ts-app/core/SyncOption"

declare module "@effect-ts/system/Sync/core" {
  export interface Sync<R, E, A> extends XPure<unknown, unknown, unknown, R, E, A> {
    /**
     * @ets_rewrite_method toEffect from "@effect-ts-app/core/Sync"
     */
    toEffect<R, E, A>(this: Sync<R, E, A>): Effect<R, E, A>

    // Undo the selection for Effect for now.
    chain<RX, EX, AX, R2, E2, B>(
      this: Sync<RX, EX, AX>,
      f: (a: AX) => Effect<R2, E2, B>
    ): ["Not supported currently, use toEffect and chain", never]

    /**
     * @ets_rewrite_method map_ from "@effect-ts/core/Sync"
     */
    map<R, E, A, A2>(this: Sync<R, E, A>, f: (e: A) => A2): Sync<R, E, A2>

    /**
     * @ets_rewrite_method mapError_ from "@effect-ts/core/Sync"
     */
    mapError<R, E, E2, A>(this: Sync<R, E, A>, f: (e: E) => E2): Sync<R, E2, A>

    /**
     * @ets_rewrite_method map_ from "@effect-ts-app/core/SyncOption"
     */
    mapOption<RX, EX, AX, B>(
      this: SyncOption<RX, EX, AX>,
      f: (a: AX) => B
    ): SyncOption<RX, EX, B>

    /**
     * @ets_rewrite_method chain_ from "@effect-ts-app/core/SyncOption"
     */
    chainOption<RX, EX, AX, R2, E2, B>(
      this: SyncOption<RX, EX, AX>,
      f: (a: AX) => SyncOption<R2, E2, B>
    ): SyncOption<RX & R2, EX | E2, B>

    /**
     * @ets_rewrite_method chainSync_ from "@effect-ts-app/core/SyncOption"
     */
    chainOptionSync<RX, EX, AX, R2, E2, B>(
      this: SyncOption<RX, EX, AX>,
      f: (a: AX) => Sync<R2, E2, B>
    ): SyncOption<RX & R2, EX | E2, B>

    /**
     * @ets_rewrite_method toNullable from "@effect-ts-app/core/SyncOption"
     */
    toNullable<R, E, A>(this: SyncOption<R, E, A>): Sync<R, E, A | null>

    /**
     * @ets_rewrite_method alt_ from "@effect-ts-app/core/SyncOption"
     */
    alt<R, E, A, R2, E2, A2>(
      this: SyncOption<R, E, A>,
      f: () => SyncOption<R2, E2, A2>
    ): SyncOption<R & R2, E | E2, A | A2>

    /**
     * @ets_rewrite_method getOrElse_ from "@effect-ts-app/core/SyncOption"
     */
    getOrElse<R, E, A, A2>(this: SyncOption<R, E, A>, f: () => A2): Sync<R, E, A | A2>

    /**
     * @ets_rewrite_method getOrFail_ from "@effect-ts-app/core/SyncOption"
     */
    getOrFail<R, E, E2, A>(
      this: SyncOption<R, E, A>,
      onNone: () => E2
    ): Sync<R, E | E2, A>
  }
}
