import { pretty } from "@effect-ts/core/Effect/Cause"
import * as L from "@effect-ts/core/Effect/Layer"
import { pipe } from "@effect-ts/core/Function"
import { Exit } from "@effect-ts/system/Exit"
import * as T from "@effect-ts-app/core/Effect"
import React, { createContext, ReactNode, useContext, useEffect, useMemo } from "react"

export type GetProvider<P> = P extends L.Layer<unknown, unknown, infer TP> ? TP : never

export interface ServiceContext<R> {
  readonly provide: <E, A>(
    self: Effect<R & Effect.DefaultEnv, E, A>
  ) => Effect<unknown, E, A>

  /**
   * Fire and Forget. Errors are logged however.
   */
  readonly runWithErrorLog: <E, A>(self: Effect<R & Effect.DefaultEnv, E, A>) => () => void

  /**
   * Fire and Forget. A promise that never fails nor returns any value.
   * Errors are logged however.
   */
  readonly runPromiseWithErrorLog: <E, A>(
    self: Effect<R & Effect.DefaultEnv, E, A>
  ) => Promise<void>

  /**
   * A Promise that never fails, the Resolved value is an Exit result that can be either Success or Failed
   */
  readonly runPromiseExit: <E, A>(
    self: Effect<R & Effect.DefaultEnv, E, A>
  ) => Promise<Exit<E, A>>
}

const MissingContext = Effect.die(
  "service context not provided, wrap your app in LiveServiceContext"
)
export function makeApp<R>() {
  const ServiceContext = createContext<ServiceContext<R>>({
    provide: () => MissingContext,
    runWithErrorLog: () => runWithErrorLog(MissingContext),
    runPromiseWithErrorLog: () => runPromiseWithErrorLog(MissingContext),
    runPromiseExit: () => runPromiseExit(MissingContext),
  })

  const LiveServiceContext = ({
    children,
    env,
  }: {
    children: ReactNode
    env: L.Layer<unknown, never, R>
  }) => {
    const provider = useMemo(() => L.unsafeMainProvider(env), [env])

    const ctx = useMemo(
      () => ({
        provide: provider.provide,
        runWithErrorLog: <E, A>(self: Effect<R & Effect.DefaultEnv, E, A>) =>
          runWithErrorLog(provider.provide(self)),
        runPromiseWithErrorLog: <E, A>(self: Effect<R & Effect.DefaultEnv, E, A>) =>
          runPromiseWithErrorLog(provider.provide(self)),
        runPromiseExit: <E, A>(self: Effect<R & Effect.DefaultEnv, E, A>) =>
          runPromiseExit(provider.provide(self)),
      }),
      [provider]
    )

    useEffect(() => {
      const cancel = Effect.runCancel(provider.allocate)
      return () => {
        Effect.run(cancel)
        Effect.run(provider.release)
      }
    }, [provider])

    return <ServiceContext.Provider value={ctx}>{children}</ServiceContext.Provider>
  }

  const useServiceContext = () => useContext(ServiceContext)

  return {
    LiveServiceContext,
    useServiceContext,
  }
}

function runWithErrorLog<E, A>(self: Effect<unknown, E, A>) {
  const cancel = Effect.runCancel(self, (ex) => {
    if (ex._tag === "Failure") {
      console.error(pretty(ex.cause))
    }
  })
  return () => {
    Effect.run(cancel)
  }
}

function runPromiseExit<E, A>(self: Effect<unknown, E, A>) {
  return pipe(self, Effect.runPromiseExit)
}

function runPromiseWithErrorLog<E, A>(self: Effect<unknown, E, A>) {
  return runPromiseExit(self).then((ex) => {
    if (ex._tag === "Failure") {
      console.error(pretty(ex.cause))
    }
  })
}
