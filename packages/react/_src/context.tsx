import { Effect } from "@effect-ts/core/Effect"
import * as T from "@effect-ts/core/Effect"
import { pretty } from "@effect-ts/core/Effect/Cause"
import { Exit } from "@effect-ts/core/Effect/Exit"
import { Layer } from "@effect-ts/core/Effect/Layer"
import * as L from "@effect-ts/core/Effect/Layer"
import { pipe } from "@effect-ts/core/Function"
import React, { createContext, ReactNode, useContext, useEffect, useMemo } from "react"

export type GetProvider<P> = P extends Layer<unknown, unknown, infer TP> ? TP : never

export interface ServiceContext<R> {
  readonly provide: <E, A>(
    self: Effect<R & T.DefaultEnv, E, A>
  ) => Effect<unknown, E, A>

  /**
   * Fire and Forget. Errors are logged however.
   */
  readonly runWithErrorLog: <E, A>(self: Effect<R & T.DefaultEnv, E, A>) => () => void

  /**
   * Fire and Forget. A promise that never fails nor returns any value.
   * Errors are logged however.
   */
  readonly runPromiseWithErrorLog: <E, A>(
    self: Effect<R & T.DefaultEnv, E, A>
  ) => Promise<void>

  /**
   * A Promise that never fails, the Resolved value is an Exit result that can be either Success or Failed
   */
  readonly runPromiseExit: <E, A>(
    self: Effect<R & T.DefaultEnv, E, A>
  ) => Promise<Exit<E, A>>
}

const MissingContext = T.die(
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
    env: Layer<unknown, never, R>
  }) => {
    const provider = useMemo(() => L.unsafeMainProvider(env), [env])

    const ctx = useMemo(
      () => ({
        provide: provider.provide,
        runWithErrorLog: <E, A>(self: Effect<R & T.DefaultEnv, E, A>) =>
          runWithErrorLog(provider.provide(self)),
        runPromiseWithErrorLog: <E, A>(self: Effect<R & T.DefaultEnv, E, A>) =>
          runPromiseWithErrorLog(provider.provide(self)),
        runPromiseExit: <E, A>(self: Effect<R & T.DefaultEnv, E, A>) =>
          runPromiseExit(provider.provide(self)),
      }),
      [provider]
    )

    useEffect(() => {
      const cancel = T.runCancel(provider.allocate)
      return () => {
        T.run(cancel)
        T.run(provider.release)
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
  const cancel = T.runCancel(self, (ex) => {
    if (ex._tag === "Failure") {
      console.error(pretty(ex.cause))
    }
  })
  return () => {
    T.run(cancel)
  }
}

function runPromiseExit<E, A>(self: Effect<unknown, E, A>) {
  return pipe(self, T.runPromiseExit)
}

function runPromiseWithErrorLog<E, A>(self: Effect<unknown, E, A>) {
  return runPromiseExit(self).then((ex) => {
    if (ex._tag === "Failure") {
      console.error(pretty(ex.cause))
    }
  })
}
