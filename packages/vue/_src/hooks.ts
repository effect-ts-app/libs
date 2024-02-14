/* eslint-disable @typescript-eslint/no-explicit-any */
import { tuple } from "@effect-app/core/Function"
import type * as HttpClient from "@effect/platform/Http/Client"
import { Cause, Effect, Exit, Fiber, Option } from "effect-app"
import { Done, hasValue, Initial, isInitializing, isSuccess, Loading, queryResult, Refreshing } from "effect-app/client"
import type { ApiConfig, FetchResponse, QueryResult } from "effect-app/client"
import { InterruptedException } from "effect/Cause"
import * as Either from "effect/Either"
import { FiberFailureCauseId, isFiberFailure } from "effect/Runtime"
import * as swrv from "swrv"
import type { fetcherFn, IKey, IResponse } from "swrv/dist/types.js"
import type { ComputedRef, Ref } from "vue"
import { computed, ref, shallowRef } from "vue"
import { run } from "./internal.js"

export { isFailed, isInitializing, isSuccess } from "effect-app/client"

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

export function useMutate<E, A>(
  self: { handler: Effect<FetchResponse<A>, E, ApiConfig | HttpClient.Client.Default>; mapPath: string }
) {
  const fn = () =>
    run.value(self.handler).then((_) => _.body).catch((_) => {
      if (!isFiberFailure(_)) throw _
      const cause = _[FiberFailureCauseId]
      throw Cause.squash(cause)
    })
  return () => mutate(self.mapPath, fn)
}

export function useMutateWithArg<Arg, E, A>(
  self: {
    handler: (arg: Arg) => Effect<FetchResponse<A>, E, ApiConfig | HttpClient.Client.Default>
    mapPath: (arg: Arg) => string
  }
) {
  const fn = (arg: Arg) =>
    run.value(self.handler(arg)).then((_) => _.body).catch((_) => {
      if (!isFiberFailure(_)) throw _
      const cause = _[FiberFailureCauseId]
      throw Cause.squash(cause)
    })
  return (arg: Arg) => mutate(self.mapPath(arg), fn(arg))
}

export type WatchSource<T = any> = Ref<T> | ComputedRef<T> | (() => T)

export function useSafeQuery<E, A>(
  self: {
    handler: Effect<FetchResponse<A>, E, ApiConfig | HttpClient.Client.Default>
    mapPath: string
  },
  config?: swrv.IConfig<A, fetcherFn<A>> | undefined
): readonly [ComputedRef<QueryResult<E, A>>, ComputedRef<A | undefined>, () => Promise<void>, IResponse<A, E>]
export function useSafeQuery<Arg, E, A>(
  self: {
    handler: (arg: Arg) => Effect<FetchResponse<A>, E, ApiConfig | HttpClient.Client.Default>
    mapPath: (arg: Arg) => string
  },
  arg: Arg | WatchSource<Arg>,
  config?: swrv.IConfig<A, fetcherFn<A>> | undefined
): readonly [ComputedRef<QueryResult<E, A>>, ComputedRef<A | undefined>, () => Promise<void>, IResponse<A, E>]
export function useSafeQuery(
  self: any, // {
  //   handler: (arg: Arg) => Effect<FetchResponse<A>, E, ApiConfig | HttpClient.Client.Default>
  //   mapPath: (arg: Arg) => string
  // } | {
  //   handler: Effect<FetchResponse<A>, E, ApiConfig | HttpClient.Client.Default>
  //   mapPath: string
  // },
  arg?: any, // Arg | WatchSource<Arg> | swrv.IConfig<A, fetcherFn<A>> | undefined,
  config?: any // swrv.IConfig<A, fetcherFn<A>> | undefined
) {
  return Effect.isEffect(self.handler)
    ? useSafeQuery_(self.mapPath, () => self.handler, arg)
    : useSafeQueryWithArg_(self.handler, self.mapPath, arg, config)
}

export function useSafeQueryWithArg_<Arg, E, A>(
  self: (arg: Arg) => Effect<FetchResponse<A>, E, ApiConfig | HttpClient.Client.Default>,
  mapPath: (arg: Arg) => string,
  arg: Arg | WatchSource<Arg>,
  config?: swrv.IConfig<A, fetcherFn<A>> | undefined
) {
  const arr = arg
  const r: { value: Arg } = typeof arr === "function"
    ? {
      get value() {
        return (arr as any)()
      }
    } as any
    : ref(arg)
  return useSafeQuery_(computed(() => mapPath(r.value)), () => self(r.value), config)
}

export function useSafeQuery_<E, A>(
  key: string | WatchSource<string>,
  self: () => Effect<FetchResponse<A>, E, ApiConfig | HttpClient.Client.Default>,
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
  const swr = useSWRV<A, E>(key, () =>
    run
      .value(self())
      .then((_) => _.body)
      .catch((_) => {
        if (!isFiberFailure(_)) throw _
        const cause = _[FiberFailureCauseId]
        throw Cause.squash(cause)
      }), config)
  const result = computed(() =>
    swrToQuery({ data: swr.data.value, error: swr.error.value, isValidating: swr.isValidating.value })
  ) // ref<QueryResult<E, A>>()
  const latestSuccess = computed(() => {
    const value = result.value
    return isSuccess(value)
      ? Either.isRight(value.current)
        ? value.current.right
        : Option.isSome(value.previous)
        ? value.previous.value
        : undefined
      : undefined
  })

  return tuple(result, latestSuccess, () => swr.mutate(), swr)
}

export function make<R, E, A>(self: Effect<FetchResponse<A>, E, R>) {
  const result = shallowRef(new Initial() as QueryResult<E, A>)

  const execute = Effect
    .sync(() => {
      result.value = isInitializing(result.value)
        ? new Loading()
        : new Refreshing(result.value)
    })
    .andThen(queryResult(self.map((_) => _.body)))
    .flatMap((r) => Effect.sync(() => result.value = r))

  const latestSuccess = computed(() => {
    const value = result.value
    return hasValue(value)
      ? Either.isRight(value.current)
        ? value.current.right
        : Option.isSome(value.previous)
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
  <I, E, A>(self: { handler: (i: I) => Effect<A, E, ApiConfig | HttpClient.Client.Default> }): readonly [
    Readonly<Ref<MutationResult<E, A>>>,
    (
      i: I,
      abortSignal?: AbortSignal
    ) => Promise<Either.Either<E, A>>
  ]
  <E, A>(self: { handler: Effect<A, E, ApiConfig | HttpClient.Client.Default> }): readonly [
    Readonly<Ref<MutationResult<E, A>>>,
    (
      abortSignal?: AbortSignal
    ) => Promise<Either.Either<E, A>>
  ]
} = <I, E, A>(
  self: {
    handler:
      | ((i: I) => Effect<A, E, ApiConfig | HttpClient.Client.Default>)
      | Effect<A, E, ApiConfig | HttpClient.Client.Default>
  }
) => {
  const state: Ref<MutationResult<E, A>> = ref<MutationResult<E, A>>({ _tag: "Initial" }) as any

  function handleExit(exit: Exit.Exit<A, E>): Effect<Either.Either<E, A>, never, never> {
    return Effect.sync(() => {
      if (Exit.isSuccess(exit)) {
        state.value = { _tag: "Success", data: exit.value }
        return Either.right(exit.value)
      }

      const err = Cause.failureOption(exit.cause)
      if (Option.isSome(err)) {
        state.value = { _tag: "Error", error: err.value }
        return Either.left(err.value)
      }

      const died = Cause.dieOption(exit.cause)
      if (Option.isSome(died)) {
        throw died.value
      }
      const interrupted = Cause.interruptOption(exit.cause)
      if (Option.isSome(interrupted)) {
        throw new InterruptedException()
      }
      throw new Error("Invalid state")
    })
  }

  const exec = (fst?: I | AbortSignal, snd?: AbortSignal) => {
    let effect: Effect<A, E, ApiConfig | HttpClient.Client.Default>
    let abortSignal: AbortSignal | undefined
    if (Effect.isEffect(self.handler)) {
      effect = self.handler as any
      abortSignal = fst as AbortSignal | undefined
    } else {
      effect = self.handler(fst as I)
      abortSignal = snd
    }

    return run.value(
      Effect
        .sync(() => {
          state.value = { _tag: "Loading" }
        })
        .andThen(effect)
        .pipe(Effect.exit)
        .flatMap(handleExit)
        .pipe(Effect.fork)
        .flatMap((f) => {
          const cancel = () => run.value(Fiber.interrupt(f))
          abortSignal?.addEventListener("abort", () => void cancel().catch(console.error))
          return Fiber.join(f)
        })
    )
  }

  return tuple(
    state,
    exec
  )
}
