import type { EffectUnunified } from "@effect-app/prelude/_ext/allLowerFirst"
import type { ApiConfig, FetchResponse } from "@effect-app/prelude/client"
import type * as swrv from "swrv"
import type { fetcherFn } from "swrv/dist/types.js"
import type { Ref } from "vue"
import { computed, ref } from "vue"
import type { MutationError, MutationResult, MutationSuccess } from "./hooks.js"
import { run } from "./internal.js"
import { swrToQuery, useSWRV } from "./swrv.js"

// TODO GET RID OF abortsignal, use run to fiber?
/**
 * Pass a function that returns an Effect, e.g from a client action, or an Effect
 * Returns a tuple with state ref and execution function which reports errors as Toast.
 */
export const useMutationEffect: {
  <I, R, E, A>(self: (i: I) => Effect<R, E, A>): readonly [
    Readonly<Ref<MutationResult<E, A>>>,
    (
      i: I
    ) => EffectUnunified<R, E, MutationSuccess<A> | MutationError<E>>
  ]
  <R, E, A>(self: EffectUnunified<R, E, A>): readonly [
    Readonly<Ref<MutationResult<E, A>>>,
    Effect<R, E, MutationSuccess<A> | MutationError<E>>
  ]
} = <I, R, E, A>(
  self: ((i: I) => EffectUnunified<R, E, A>) | EffectUnunified<R, E, A>
) =>
  (typeof self === "function"
    ? useMutationInputInternal
    : useMutationEffectInternal) as any

export const useMutationEffectInternal: <R, E, A>(self: Effect<R, E, A>) => readonly [
  Readonly<Ref<MutationResult<E, A>>>,
  Effect<R, E, MutationSuccess<A> | MutationError<E>>
] = <R, E, A>(
  self: Effect<R, E, A>
) => {
  const state: Ref<MutationResult<E, A>> = ref<MutationResult<E, A>>({ _tag: "Initial" })

  const exec = Effect
    .sync(() => {
      state.value = { _tag: "Loading" }
    })
    .zipRight(self)
    .map((data): MutationSuccess<A> => ({ _tag: "Success", data }))
    .catchAll((error) => Effect.sync((): MutationError<E> => ({ _tag: "Error", error })))
    .tap((v) => state.value = v)

  return tuple(
    state,
    exec
  )
}

export const useMutationInputInternal: {
  <I, R, E, A>(self: (i: I) => Effect<R, E, A>): readonly [
    Readonly<Ref<MutationResult<E, A>>>,
    (
      i: I
    ) => Effect<R, E, MutationSuccess<A> | MutationError<E>>
  ]
} = <I, R, E, A>(
  self: (i: I) => Effect<R, E, A>
) => {
  const state: Ref<MutationResult<E, A>> = ref<MutationResult<E, A>>({ _tag: "Initial" })

  const exec = (fst: I) => {
    return Effect
      .sync(() => {
        state.value = { _tag: "Loading" }
      })
      .zipRight(self(fst))
      .map((data): MutationSuccess<A> => ({ _tag: "Success", data }))
      .catchAll((error) => Effect.sync((): MutationError<E> => ({ _tag: "Error", error })))
      .tap((v) => state.value = v)
  }

  return tuple(
    state,
    exec
  )
}

/// q

export function useSafeQueryEffectWithArg<Arg, E, A>(
  self: ((arg: Arg) => Effect<ApiConfig | HttpClient.Default, E, FetchResponse<A>>) & { mapPath: (arg: Arg) => string },
  arg: Arg,
  config?: swrv.IConfig<A, fetcherFn<A>> | undefined
) {
  return useSafeQueryEffectWithArg_(self, self.mapPath, arg, config)
}

export function useSafeQueryEffect<E, A>(
  self: Effect<ApiConfig | HttpClient.Default, E, FetchResponse<A>> & { mapPath: string },
  config?: swrv.IConfig<A, fetcherFn<A>> | undefined
) {
  return useSafeQueryEffect_(self.mapPath, self, config)
}

export function useSafeQueryEffectWithArg_<Arg, E, A>(
  self: (arg: Arg) => Effect<ApiConfig | HttpClient.Default, E, FetchResponse<A>>,
  mapPath: (arg: Arg) => string,
  arg: Arg,
  config?: swrv.IConfig<A, fetcherFn<A>> | undefined
) {
  return useSafeQueryEffect_(mapPath(arg), self(arg), config)
}

export function useSafeQueryEffect_<E, A>(
  key: string,
  self: Effect<ApiConfig | HttpClient.Default, E, FetchResponse<A>>,
  config?: swrv.IConfig<A, fetcherFn<A>> | undefined
) {
  // const [result, latestSuccess, execute] = make(self)

  // TODO: support with interruption
  // const sem = Semaphore.unsafeMake(1)
  // const lock = sem.withPermits(1)
  // let fib: Fiber.FiberContext<E, FetchResponse<A>> | undefined = undefined
  // const execute = self
  // const runNew = execute.fork()
  //   .tap(newFiber =>
  //     Effect.sync(() => {
  //       fib = newFiber
  //     })
  //   )

  // const ex = lock(
  //   Effect.suspend(() => {
  //     return fib
  //       ? Fiber.interrupt(fib).zipRight(runNew)
  //       : runNew
  //   })
  // ).flatMap(Fiber.await)
  // function execWithInterruption() {
  //   return ex.provide(Layers)
  //     .runPromise()
  //     .catch(err => {
  //       if (!Cause.isInterruptedException(err)) throw err
  //       return undefined
  //     })
  // }

  // const swr = useSWRV<A, E>(key, () => execWithInterruption().then(_ => _?.body as any)) // Effect.runPromise(self.provide(Layers))
  const swr = useSWRV<A, E>(key, () => run.value(self).then((_) => _.body), config)
  const result = computed(() =>
    swrToQuery({ data: swr.data.value, error: swr.error.value, isValidating: swr.isValidating.value })
  ) // ref<QueryResult<E, A>>()
  const latestSuccess = computed(() => {
    const value = result.value
    return value.isSuccess()
      ? value.current.isRight()
        ? value.current.right
        : value.previous.isSome()
        ? value.previous.value
        : undefined
      : undefined
  })

  return tuple(result, latestSuccess, Effect.promise(() => swr.mutate()), swr)
}
