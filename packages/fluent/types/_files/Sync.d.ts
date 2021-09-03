/* eslint-disable import/no-duplicates */
import type * as T from "@effect-ts/core/Effect"
import type * as S from "@effect-ts/core/Sync"
import type { XPure } from "@effect-ts/system/XPure"
import type { SyncOption } from "@effect-ts-app/core/SyncOption"
import type * as SO from "@effect-ts-app/core/SyncOption"

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

    /**
     * @ets_rewrite_method map_ from "@effect-ts-app/core/SyncOption"
     */
    mapOption<RX, EX, AX, B>(
      this: SO.SyncOption<RX, EX, AX>,
      f: (a: AX) => B,
      __trace?: string
    ): SO.SyncOption<RX, EX, B>

    /**
     * @ets_rewrite_method chain_ from "@effect-ts-app/core/SyncOption"
     */
    chainOption<RX, EX, AX, R2, E2, B>(
      this: SO.SyncOption<RX, EX, AX>,
      f: (a: AX) => SO.SyncOption<R2, E2, B>,
      __trace?: string
    ): SO.SyncOption<RX & R2, EX | E2, B>

    /**
     * @ets_rewrite_method chainSync_ from "@effect-ts-app/core/SyncOption"
     */
    chainOptionSync<RX, EX, AX, R2, E2, B>(
      this: SO.SyncOption<RX, EX, AX>,
      f: (a: AX) => Sync<R2, E2, B>,
      __trace?: string
    ): SO.SyncOption<RX & R2, EX | E2, B>

    /**
     * @ets_rewrite_method toNullable from "@effect-ts-app/core/SyncOption"
     */
    toNullable<R, E, A>(this: SO.SyncOption<R, E, A>): Sync<R, E, A | null>

    /**
     * @ets_rewrite_method alt_ from "@effect-ts-app/core/SyncOption"
     */
    alt<R, E, A, R2, E2, A2>(
      this: SO.SyncOption<R, E, A>,
      f: () => SO.SyncOption<R2, E2, A2>
    ): SO.SyncOption<R & R2, E | E2, A | A2>

    /**
     * @ets_rewrite_method getOrElse_ from "@effect-ts-app/core/SyncOption"
     */
    getOrElse<R, E, A, A2>(
      this: SO.SyncOption<R, E, A>,
      f: () => A2
    ): S.Sync<R, E, A | A2>
  }
}
