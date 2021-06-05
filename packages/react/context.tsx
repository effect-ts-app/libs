import { pretty } from "@effect-ts/core/Effect/Cause"
import * as L from "@effect-ts/core/Effect/Layer"
import { pipe } from "@effect-ts/core/Function"
import { Exit } from "@effect-ts/system/Exit"
import * as T from "@effect-ts-app/core/Effect"
import React, { createContext, ReactNode, useContext, useEffect, useMemo } from "react"

export type GetProvider<P> = P extends L.Layer<unknown, unknown, infer TP> ? TP : never

export interface ServiceContext<R> {
  readonly provide: <E, A>(self: T.Effect<R, E, A>) => T.Effect<unknown, E, A>
  readonly runWithErrorLog: <E, A>(self: T.Effect<R, E, A>) => () => void
  readonly runPromise: <E, A>(self: T.Effect<R, E, A>) => Promise<Exit<E, A>>
}

const MissingContext = T.die(
  "service context not provided, wrap your app in LiveServiceContext"
)
export function makeApp<R>() {
  const ServiceContext = createContext<ServiceContext<R>>({
    provide: () => MissingContext,
    runWithErrorLog: () => runWithErrorLog(MissingContext),
    runPromise: () => runPromiseWithErrorLog(MissingContext),
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
        runWithErrorLog: <E, A>(self: T.Effect<R, E, A>) =>
          runWithErrorLog(provider.provide(self)),
        runPromise: <E, A>(self: T.Effect<R, E, A>) =>
          runPromiseWithErrorLog(provider.provide(self)),
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

function runWithErrorLog<E, A>(self: T.Effect<unknown, E, A>) {
  const cancel = T.runCancel(self, (ex) => {
    if (ex._tag === "Failure") {
      console.error(pretty(ex.cause))
    }
  })
  return () => {
    T.run(cancel)
  }
}

function runPromiseWithErrorLog<E, A>(self: T.Effect<unknown, E, A>) {
  return pipe(self, T.runPromiseExit).then((ex) => {
    if (ex._tag === "Failure") {
      console.error(pretty(ex.cause))
    }
    return ex
  })
}
