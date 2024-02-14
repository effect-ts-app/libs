/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { QueryObserverOptions } from "@tanstack/vue-query"
import { useQuery } from "@tanstack/vue-query"
import { Cause, Effect, Either, Option, pipe, Runtime } from "effect-app"
import { Done, Initial, isSuccess, Loading, Refreshing } from "effect-app/client"
import type { ApiConfig, FetchResponse, QueryResult } from "effect-app/client"
import type { HttpClient } from "effect-app/Request"
import { computed, ref, type WatchSource } from "vue"
import { run } from "./internal.js"

// TODO: options
// declare function useQuery<TQueryFnData = unknown, TError = DefaultError, TData = TQueryFnData, TQueryKey extends QueryKey = QueryKey>(options: UndefinedInitialQueryOptions<TQueryFnData, TError, TData, TQueryKey>, queryClient?: QueryClient): UseQueryReturnType<TData, TError>;
// declare function useQuery<TQueryFnData = unknown, TError = DefaultError, TData = TQueryFnData, TQueryKey extends QueryKey = QueryKey>(options: DefinedInitialQueryOptions<TQueryFnData, TError, TData, TQueryKey>, queryClient?: QueryClient): UseQueryDefinedReturnType<TData, TError>;
// declare function useQuery<TQueryFnData = unknown, TError = DefaultError, TData = TQueryFnData, TQueryKey extends QueryKey = QueryKey>(options: UseQueryOptions<TQueryFnData, TError, TData, TQueryFnData, TQueryKey>, queryClient?: QueryClient): UseQueryReturnType<TData, TError>;
export const useSafeQuery = <I, A, E>(
  q:
    | {
      handler: (
        req: I
      ) => Effect<
        FetchResponse<A>,
        E,
        ApiConfig | HttpClient.Default
      >
      mapPath: (req: I) => string
      name: string
    }
    | {
      handler: Effect<
        FetchResponse<A>,
        E,
        ApiConfig | HttpClient.Default
      >
      mapPath: string
      name: string
    },
  arg?: I | WatchSource<I>,
  options: QueryObserverOptions<any, any, any> = {} // TODO
) => {
  const arr = arg
  const req: { value: I } = !arg
    ? undefined
    : typeof arr === "function"
    ? ({
      get value() {
        return (arr as any)()
      }
    } as any)
    : ref(arg)
  const queryKey = pipe(q.name.split("/"), (split) => split.map((_) => "$" + _)).join("/").split(".")
  const r = useQuery(
    Effect.isEffect(q.handler)
      ? {
        ...options,
        queryKey,
        queryFn: () =>
          run
            .value(q.handler as any)
            .then((_) => (_ as any).body)
            .catch((_) => {
              if (!Runtime.isFiberFailure(_)) throw _
              const cause = _[Runtime.FiberFailureCauseId]
              throw Cause.squash(cause)
            })
      }
      : {
        ...options,
        queryKey: [...queryKey, req],
        queryFn: () =>
          run
            .value((q.handler as any)(req.value))
            .then((_) => (_ as any).body)
            .catch((_) => {
              if (!Runtime.isFiberFailure(_)) throw _
              const cause = _[Runtime.FiberFailureCauseId]
              throw Cause.squash(cause)
            })
      }
  )

  const result = computed(() =>
    swrToQuery({
      error: r.error.value,
      data: r.data.value,
      isValidating: r.isFetching.value
    })
  )
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
  return [result, latestSuccess, r.refetch] as const
}

function swrToQuery<E, A>(r: {
  error: E | undefined
  data: A | undefined
  isValidating: boolean
}): QueryResult<E, A> {
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
