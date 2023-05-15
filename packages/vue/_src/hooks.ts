import type { Http } from "@effect-app/core/http/http-client"
import type { ApiConfig, FetchResponse } from "@effect-app/prelude/client"
import { Done, Initial, Loading } from "@effect-app/prelude/client"
import { InterruptedException } from "@effect/io/Cause"
import * as swrv from "swrv"
import type { fetcherFn, IKey, IResponse } from "swrv/dist/types.js"
import type { Ref } from "vue"
import { computed, ref, shallowRef } from "vue"
import { run } from "./internal.js"

export { isFailed, isInitializing, isSuccess } from "@effect-app/prelude/client"

type useSWRVType = {
  <Data, Error>(key: IKey): IResponse<Data, Error>
  <Data, Error>(
    key: IKey,
    fn?: fetcherFn<Data>,
    config?: swrv.IConfig<Data, fetcherFn<Data>>
  ): IResponse<Data, Error>
}
type MutateType = {
  <Data>(
    key: string,
    res: Data | Promise<Data>,
    cache?: swrv.SWRVCache<Omit<IResponse<any, any>, "mutate">>,
    ttl?: number
  ): Promise<{
    data: any
    error: any
    isValidating: any
  }>
}
// madness - workaround different import behavior on server and client
const useSWRV = (swrv.default.default ? swrv.default.default : swrv.default) as unknown as useSWRVType
export const mutate = (swrv.default.mutate ? swrv.default.mutate : swrv.mutate) as unknown as MutateType

function swrToQuery<E, A>(
  r: { error: E | undefined; data: A | undefined; isValidating: boolean }
): QueryResult<E, A> {
  if (r.error) {
    return r.isValidating
      ? Refreshing.fail<E, A>(r.error, r.data)
      : Done.fail<E, A>(r.error, r.data)
  }
  if (r.data !== undefined) {
    return r.isValidating
      ? Refreshing.succeed<A, E>(r.data)
      : Done.succeed<A, E>(r.data)
  }

  return r.isValidating ? new Loading() : new Initial()
}

export function useMutate<E, A>(self: Effect<ApiConfig | Http, E, FetchResponse<A>> & { mapPath: string }) {
  const fn = () => run.value(self).then((_) => _.body)
  return () => mutate(self.mapPath, fn)
}

export function useMutateWithArg<Arg, E, A>(
  self: ((arg: Arg) => Effect<ApiConfig | Http, E, FetchResponse<A>>) & { mapPath: (arg: Arg) => string }
) {
  const fn = (arg: Arg) => run.value(self(arg)).then((_) => _.body)
  return (arg: Arg) => mutate(self.mapPath(arg), fn(arg))
}

// TODO: same trick with mutations/actions
export function useSafeQueryWithArg<Arg, E, A>(
  self: ((arg: Arg) => Effect<ApiConfig | Http, E, FetchResponse<A>>) & { mapPath: (arg: Arg) => string },
  arg: Arg,
  config?: swrv.IConfig<A, fetcherFn<A>> | undefined
) {
  return useSafeQueryWithArg_(self, self.mapPath, arg, config)
}

export function useSafeQuery<E, A>(
  self: Effect<ApiConfig | Http, E, FetchResponse<A>> & { mapPath: string },
  config?: swrv.IConfig<A, fetcherFn<A>> | undefined
) {
  return useSafeQuery_(self.mapPath, self, config)
}

export function useSafeQueryWithArg_<Arg, E, A>(
  self: (arg: Arg) => Effect<ApiConfig | Http, E, FetchResponse<A>>,
  mapPath: (arg: Arg) => string,
  arg: Arg,
  config?: swrv.IConfig<A, fetcherFn<A>> | undefined
) {
  return useSafeQuery_(mapPath(arg), self(arg), config)
}

export function useSafeQuery_<E, A>(
  key: string,
  self: Effect<ApiConfig | Http, E, FetchResponse<A>>,
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
  //   .flatMap(Effect.done)

  // function execWithInterruption() {
  //   return ex.provideSomeLayer(Layers)
  //     .runPromise()
  //     .catch(err => {
  //       if (!Cause.isInterruptedException(err)) throw err
  //       return undefined
  //     })
  // }

  // const swr = useSWRV<A, E>(key, () => execWithInterruption().then(_ => _?.body as any)) // Effect.runPromise(self.provideSomeLayer(Layers))
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

export function useSafeQueryLegacy<E, A>(self: Effect<ApiConfig | Http, E, FetchResponse<A>>) {
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
    .flatMap((_) => _.await())
    .flatMap((_) => _.done)

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
  <I, E, A>(self: (i: I) => Effect<ApiConfig | Http, E, A>): readonly [
    Readonly<Ref<MutationResult<E, A>>>,
    (
      i: I,
      abortSignal?: AbortSignal
    ) => Promise<Either<E, A>>
  ]
  <E, A>(self: Effect<ApiConfig | Http, E, A>): readonly [
    Readonly<Ref<MutationResult<E, A>>>,
    (
      abortSignal?: AbortSignal
    ) => Promise<Either<E, A>>
  ]
} = <I, E, A>(self: ((i: I) => Effect<ApiConfig | Http, E, A>) | Effect<ApiConfig | Http, E, A>) => {
  const state: Ref<MutationResult<E, A>> = ref<MutationResult<E, A>>({ _tag: "Initial" }) as any

  function handleExit(exit: Exit<E, A>): Effect<never, never, Either<E, A>> {
    return Effect.sync(() => {
      if (exit.isSuccess()) {
        state.value = { _tag: "Success", data: exit.value }
        return Either(exit.value)
      }

      const err = exit.cause.failureOption
      if (err.isSome()) {
        state.value = { _tag: "Error", error: err.value }
        return Either.left(err.value)
      }

      const died = exit.cause.dieOption
      if (died.value) {
        throw died.value
      }
      const interrupted = exit.cause.interruptOption
      if (interrupted.value) {
        throw InterruptedException()
      }
      throw new Error("Invalid state")
    })
  }

  const exec = (fst?: I | AbortSignal, snd?: AbortSignal) => {
    let effect: Effect<ApiConfig | Http, E, A>
    let abortSignal: AbortSignal | undefined
    if (typeof self === "function") {
      effect = self(fst as I)
      abortSignal = snd
    } else {
      effect = self
      abortSignal = fst as AbortSignal | undefined
    }

    return run.value(
      Effect
        .sync(() => {
          state.value = { _tag: "Loading" }
        })
        .zipRight(effect)
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

  return tuple(
    state,
    exec
  )
}
