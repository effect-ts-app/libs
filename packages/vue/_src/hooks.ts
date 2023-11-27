import { Initial, Loading } from "@effect-app/prelude/client"
import type { ApiConfig, FetchResponse } from "@effect-app/prelude/client"
import { InterruptedException } from "effect/Cause"
import * as swrv from "swrv"
import type { fetcherFn } from "swrv/dist/types.js"
import type { Ref } from "vue"
import { computed, shallowRef } from "vue"
import { useMutationEffect } from "./hooks2.js"
import { run } from "./internal.js"
import { swrToQuery, useSWRV } from "./swrv.js"

export { isFailed, isInitializing, isSuccess } from "@effect-app/prelude/client"

export function useMutate<E, A>(
  self: Effect<ApiConfig | HttpClient.Default, E, FetchResponse<A>> & { mapPath: string }
) {
  const fn = () => run.value(self).then((_) => _.body)
  return () => swrv.mutate(self.mapPath, fn)
}

export function useMutateWithArg<Arg, E, A>(
  self: ((arg: Arg) => Effect<ApiConfig | HttpClient.Default, E, FetchResponse<A>>) & { mapPath: (arg: Arg) => string }
) {
  const fn = (arg: Arg) => run.value(self(arg)).then((_) => _.body)
  return (arg: Arg) => swrv.mutate(self.mapPath(arg), fn(arg))
}

// TODO: same trick with mutations/actions
export function useSafeQueryWithArg<Arg, E, A>(
  self: ((arg: Arg) => Effect<ApiConfig | HttpClient.Default, E, FetchResponse<A>>) & { mapPath: (arg: Arg) => string },
  arg: Arg,
  config?: swrv.IConfig<A, fetcherFn<A>> | undefined
) {
  return useSafeQueryWithArg_(self, self.mapPath, arg, config)
}

export function useSafeQuery<E, A>(
  self: Effect<ApiConfig | HttpClient.Default, E, FetchResponse<A>> & { mapPath: string },
  config?: swrv.IConfig<A, fetcherFn<A>> | undefined
) {
  return useSafeQuery_(self.mapPath, self, config)
}

export function useSafeQueryWithArg_<Arg, E, A>(
  self: (arg: Arg) => Effect<ApiConfig | HttpClient.Default, E, FetchResponse<A>>,
  mapPath: (arg: Arg) => string,
  arg: Arg,
  config?: swrv.IConfig<A, fetcherFn<A>> | undefined
) {
  return useSafeQuery_(mapPath(arg), self(arg), config)
}

export function useSafeQuery_<E, A>(
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

  return tuple(result, latestSuccess, () => swr.mutate(), swr)
}

export function useSafeQueryLegacy<E, A>(self: Effect<ApiConfig | HttpClient.Default, E, FetchResponse<A>>) {
  const [result, latestSuccess, execute] = make(self)

  const sem = Semaphore.unsafeMake(1)
  const withPermit = sem.withPermits(1)
  let fib: Fiber.Runtime<unknown, unknown> | undefined = undefined
  const runNew = execute
    .fork
    .tap((newFiber) =>
      Effect.sync(() => {
        fib = newFiber
      })
    )

  const ex = Effect
    .suspend(() => {
      return fib
        ? fib.interrupt.zipRight(runNew)
        : runNew
    })
    .apply(withPermit)
    .flatMap((_) => _.await)

  function exec() {
    return run
      .value(ex)
      .catch((err) => {
        // TODO
        if (!JSON.stringify(err).includes("InterruptedException")) throw err
      })
  }

  return tuple(result, latestSuccess, exec)
}

export function make<R, E, A>(self: Effect<R, E, FetchResponse<A>>) {
  const result = shallowRef(new Initial() as QueryResult<E, A>)

  const execute = Effect
    .sync(() => {
      result.value = result.value.isInitializing()
        ? new Loading()
        : new Refreshing(result.value)
    })
    .zipRight(self.map((_) => _.body).asQueryResult)
    .flatMap((r) => Effect(result.value = r))

  const latestSuccess = computed(() => {
    const value = result.value
    return value.hasValue()
      ? value.current.isRight()
        ? value.current.right
        : value.previous.isSome()
        ? value.previous.value
        : undefined
      : undefined
  })

  return tuple(result, latestSuccess, execute)
}

export interface MutationInitial {
  readonly _tag: "Initial"
}

export interface MutationLoading {
  readonly _tag: "Loading"
}

export interface MutationSuccess<A> {
  readonly _tag: "Success"
  readonly data: A
}

export interface MutationError<E> {
  readonly _tag: "Error"
  readonly error: E
}

export type MutationResult<E, A> = MutationInitial | MutationLoading | MutationSuccess<A> | MutationError<E>

/**
 * Pass a function that returns an Effect, e.g from a client action, or an Effect
 * Returns a tuple with state ref and execution function which reports errors as Toast.
 */
export const useMutation: {
  <I, E, A>(self: (i: I) => Effect<ApiConfig | HttpClient.Default, E, A>): readonly [
    Readonly<Ref<MutationResult<E, A>>>,
    (
      i: I,
      abortSignal?: AbortSignal
    ) => Promise<MutationSuccess<A> | MutationError<E>>
  ]
  <E, A>(self: Effect<ApiConfig | HttpClient.Default, E, A>): readonly [
    Readonly<Ref<MutationResult<E, A>>>,
    (
      abortSignal?: AbortSignal
    ) => Promise<MutationSuccess<A> | MutationError<E>>
  ]
} = <I, E, A>(
  self: ((i: I) => Effect<ApiConfig | HttpClient.Default, E, A>) | Effect<ApiConfig | HttpClient.Default, E, A>
) => {
  function handleExit(
    exit: Exit<never, MutationSuccess<A> | MutationError<E>>
  ): Effect<never, never, MutationSuccess<A> | MutationError<E>> {
    return Effect.sync(() => {
      if (exit.isSuccess()) {
        return exit.value
      }

      const err = exit.cause.failureOption
      if (err.isSome()) {
        throw err.value
      }

      const died = exit.cause.dieOption
      if (died.value) {
        throw died.value
      }
      const interrupted = exit.cause.interruptOption
      if (interrupted.value) {
        throw new InterruptedException()
      }
      throw new Error("Invalid state")
    })
  }

  const [r, execEff] = useMutationEffect(self)

  const exec = (fst?: I | AbortSignal, snd?: AbortSignal) => {
    let effect: Effect<ApiConfig | HttpClient.Default, never, MutationSuccess<A> | MutationError<E>>
    let abortSignal: AbortSignal | undefined
    if (typeof self === "function") {
      effect = execEff(fst as I) as any
      abortSignal = snd
    } else {
      effect = execEff as any
      abortSignal = fst as AbortSignal | undefined
    }

    return run.value(
      effect
        .exit
        .flatMap(handleExit)
        .fork
        .flatMap((f) => {
          const cancel = () => run.value(f.interrupt)
          abortSignal?.addEventListener("abort", () => void cancel().catch(console.error))
          return f.join
        })
    )
  }

  return tuple(r, exec)
}
