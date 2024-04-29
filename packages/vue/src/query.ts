/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type {
  QueryKey,
  QueryObserverOptions,
  QueryObserverResult,
  RefetchOptions,
  UseQueryReturnType
} from "@tanstack/vue-query"
import { useQuery } from "@tanstack/vue-query"
import type { Cause, Runtime } from "effect-app"
import { Effect, Either, Option } from "effect-app"
import { Done, Initial, isSuccess, Loading, Refreshing } from "effect-app/client"
import type { ApiConfig, FetchResponse, QueryResult } from "effect-app/client"
import type { HttpClient } from "effect-app/http"
import { computed, ref } from "vue"
import type { ComputedRef, WatchSource } from "vue"
import { makeQueryKey, run } from "./internal.js"

export interface QueryObserverOptionsCustom<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = never
> extends
  Omit<QueryObserverOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey, TPageParam>, "queryKey" | "queryFn">
{}

export function useSafeQuery<E, A>(
  self: {
    handler: Effect<FetchResponse<A>, E, ApiConfig | HttpClient.Client.Default>
    mapPath: string
    name: string
  },
  options?: QueryObserverOptionsCustom | undefined // TODO
): readonly [
  ComputedRef<QueryResult<E, A>>,
  ComputedRef<A | undefined>,
  (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<any, any>>,
  UseQueryReturnType<any, any>
]
export function useSafeQuery<Arg, E, A>(
  self: {
    handler: (arg: Arg) => Effect<FetchResponse<A>, E, ApiConfig | HttpClient.Client.Default>
    mapPath: (arg: Arg) => string
    name: string
  },
  arg: Arg | WatchSource<Arg>,
  options?: QueryObserverOptionsCustom | undefined // TODO
): readonly [
  ComputedRef<QueryResult<E, A>>,
  ComputedRef<A | undefined>,
  (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<any, any>>,
  UseQueryReturnType<any, any>
]
export function useSafeQuery(
  self: any,
  /*
  q:
    | {
      handler: (
        req: I
      ) => Effect<
        FetchResponse<A>,
        E,
        ApiConfig | HttpClient.Client.Default
      >
      mapPath: (req: I) => string
      name: string
    }
    | {
      handler: Effect<
        FetchResponse<A>,
        E,
        ApiConfig | HttpClient.Client.Default
      >
      mapPath: string
      name: string
    },
  */
  argOrOptions?: any,
  options?: any
) {
  return Effect.isEffect(self.handler)
    ? useSafeQuery_(self, undefined, argOrOptions)
    : useSafeQuery_(self, argOrOptions, options)
}

export interface KnownFiberFailure<E> extends Runtime.FiberFailure {
  readonly [Runtime.FiberFailureCauseId]: Cause.Cause<E>
}

// TODO: options
// declare function useQuery<TQueryFnData = unknown, TError = DefaultError, TData = TQueryFnData, TQueryKey extends QueryKey = QueryKey>(options: UndefinedInitialQueryOptions<TQueryFnData, TError, TData, TQueryKey>, queryClient?: QueryClient): UseQueryReturnType<TData, TError>;
// declare function useQuery<TQueryFnData = unknown, TError = DefaultError, TData = TQueryFnData, TQueryKey extends QueryKey = QueryKey>(options: DefinedInitialQueryOptions<TQueryFnData, TError, TData, TQueryKey>, queryClient?: QueryClient): UseQueryDefinedReturnType<TData, TError>;
// declare function useQuery<TQueryFnData = unknown, TError = DefaultError, TData = TQueryFnData, TQueryKey extends QueryKey = QueryKey>(options: UseQueryOptions<TQueryFnData, TError, TData, TQueryFnData, TQueryKey>, queryClient?: QueryClient): UseQueryReturnType<TData, TError>;
export const useSafeQuery_ = <I, A, E>(
  q:
    | {
      handler: (
        req: I
      ) => Effect<
        FetchResponse<A>,
        E,
        ApiConfig | HttpClient.Client.Default
      >
      mapPath: (req: I) => string
      name: string
    }
    | {
      handler: Effect<
        FetchResponse<A>,
        E,
        ApiConfig | HttpClient.Client.Default
      >
      mapPath: string
      name: string
    },
  arg?: I | WatchSource<I>,
  options: QueryObserverOptionsCustom<any, KnownFiberFailure<E>> = {} // TODO
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
  const queryKey = makeQueryKey(q.name)
  const r = useQuery<any, KnownFiberFailure<E>>(
    Effect.isEffect(q.handler)
      ? {
        ...options,
        queryKey,
        queryFn: ({ signal }) => run.value(Effect.map(q.handler as any, (_) => (_ as any).body), { signal })
      }
      : {
        ...options,
        queryKey: [...queryKey, req],
        queryFn: ({ signal }) =>
          run
            .value(Effect.map((q.handler as any)(req.value), (_) => (_ as any).body), { signal })
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
  return [result, latestSuccess, r.refetch, r] as const
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
