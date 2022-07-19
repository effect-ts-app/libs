/* eslint-disable @typescript-eslint/no-namespace */
// ets_tracing: off

import type * as T from "@effect-ts/core/Effect"
import type { Cause } from "@effect-ts/core/Effect/Cause"
import type { Layer } from "@effect-ts/core/Effect/Layer"
import type * as M from "@effect-ts/core/Effect/Managed"
import type { Has, Tag } from "@effect-ts/system/Has"

declare module "@effect-ts/system/Managed/managed" {
  export interface ManagedStaticOps {
    /**
     * @ets_rewrite_method pipe from "@effect-ts/core/Effect/Managed"
     */
    gen: typeof M.gen

    /**
     * @ets_rewrite_method makeExit_ from "@effect-ts/core/Effect/Managed"
     */
    makeExit: typeof M.makeExit_
  }

  export const Managed: ManagedStaticOps

  export interface Managed<R, E, A> extends ManagedOps {}

  export interface ManagedOps {
    /**
     * @ets_rewrite_method pipe from "smart:pipe"
     */
    pipe<Self, Ret>(this: Self, f: (self: Self) => Ret): Ret

    /**
     * @ets_rewrite_method as_ from "@effect-ts/core/Effect/Managed"
     */
    as<RX, EX, AX, B>(
      this: M.Managed<RX, EX, AX>,
      b: B,
      __trace?: string
    ): M.Managed<RX, EX, B>

    /**
     * @ets_rewrite_method map_ from "@effect-ts/core/Effect/Managed"
     */
    map<RX, EX, AX, B>(
      this: M.Managed<RX, EX, AX>,
      f: (a: AX) => B,
      __trace?: string
    ): M.Managed<RX, EX, B>

    /**
     * @ets_rewrite_method chain_ from "@effect-ts/core/Effect/Managed"
     */
    chain<RX, EX, AX, R2, E2, B>(
      this: M.Managed<RX, EX, AX>,
      f: (a: AX) => M.Managed<R2, E2, B>,
      __trace?: string
    ): M.Managed<RX & R2, EX | E2, B>

    /**
     * @ets_rewrite_method tapM_ from "@effect-ts/core/Effect/Managed"
     */
    tap<RX, EX, AX, R2, E2, B>(
      this: M.Managed<RX, EX, AX>,
      f: (a: AX) => T.Effect<R2, E2, B>,
      __trace?: string
    ): M.Managed<RX & R2, EX | E2, AX>

    /**
     * @ets_rewrite_method tap_ from "@effect-ts/core/Effect/Managed"
     */
    tap<RX, EX, AX, R2, E2, B>(
      this: M.Managed<RX, EX, AX>,
      f: (a: AX) => M.Managed<R2, E2, B>,
      __trace?: string
    ): M.Managed<RX & R2, EX | E2, AX>

    /**
     * @ets_rewrite_method tapError_ from "@effect-ts/core/Effect/Managed"
     */
    tapError<RX, EX, AX, R2, E2, B>(
      this: M.Managed<RX, EX, AX>,
      f: (e: EX) => M.Managed<R2, E2, B>,
      __trace?: string
    ): M.Managed<RX & R2, EX | E2, AX>

    /**
     * @ets_rewrite_method tapCause_ from "@effect-ts/core/Effect/Managed"
     */
    tapCause<RX, EX, AX, R2, E2, B>(
      this: M.Managed<RX, EX, AX>,
      f: (e: Cause<EX>) => M.Managed<R2, E2, B>,
      __trace?: string
    ): M.Managed<RX & R2, EX | E2, AX>

    /**
     * @ets_rewrite_method tapBoth_ from "@effect-ts/core/Effect/Managed"
     */
    tapBoth<RX, EX, AX, R2, E2, B, R3, E3, C>(
      this: M.Managed<RX, EX, AX>,
      f: (e: EX) => M.Managed<R2, E2, B>,
      g: (e: AX) => M.Managed<R2, E3, C>,
      __trace?: string
    ): M.Managed<RX & R2 & R3, EX | E2 | E3, AX>

    /**
     * @ets_rewrite_method catchAll_ from "@effect-ts/core/Effect/Managed"
     */
    catchAll<RX, EX, AX, R2, E2, B>(
      this: M.Managed<RX, EX, AX>,
      f: (e: EX) => M.Managed<R2, E2, B>,
      __trace?: string
    ): M.Managed<RX & R2, E2, AX | B>

    /**
     * @ets_rewrite_method use_ from "@effect-ts/core/Effect/Managed"
     */
    use<RX, EX, AX, R2, E2, B>(
      this: M.Managed<RX, EX, AX>,
      f: (a: AX) => T.Effect<R2, E2, B>,
      __trace?: string
    ): T.Effect<RX & R2, EX | E2, B>

    /**
     * @ets_rewrite_method fromRawManaged from "@effect-ts/core/Effect/Layer"
     */
    toLayer<RX, EX, AX>(this: M.Managed<RX, EX, AX>): Layer<RX, EX, AX>

    /**
     * @ets_rewrite_method fromManaged_ from "@effect-ts/core/Effect/Layer"
     */
    toLayer<RX, EX, AX>(
      this: M.Managed<RX, EX, AX>,
      tag: Tag<AX>
    ): Layer<RX, EX, Has<AX>>
  }
}
