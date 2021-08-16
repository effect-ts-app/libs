/* eslint-disable @typescript-eslint/no-unused-vars */
// ets_tracing: off

import type * as T from "@effect-ts/core/Effect"
import type { defaultTeardown } from "@effect-ts/node/Runtime"

declare module "@effect-ts/system/Effect/effect" {
  export interface Effect<R, E, A> {
    runMain: [(_: R) => void] extends [(_: T.DefaultEnv) => void]
      ? {
          /**
           * @ets_rewrite_method runMain from "@effect-ts/node/Runtime"
           */
          <AX extends A>(
            customHook?: (cont: NodeJS.SignalsListener) => NodeJS.SignalsListener,
            customTeardown?: typeof defaultTeardown
          ): void
        }
      : // causes compatibility issues: ["required", (_: R) => void]
        {
          /**
           * @ets_rewrite_method runMain from "@effect-ts/node/Runtime"
           */
          <AX extends A>(
            customHook?: (cont: NodeJS.SignalsListener) => NodeJS.SignalsListener,
            customTeardown?: typeof defaultTeardown
          ): never
        }
  }
}
