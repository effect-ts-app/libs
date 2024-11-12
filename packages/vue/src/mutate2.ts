/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Result from "@effect-rx/rx/Result"
import type { InvalidateOptions, InvalidateQueryFilters } from "@tanstack/vue-query"
import { useQueryClient } from "@tanstack/vue-query"
import { Cause, Effect, Exit, Option } from "effect-app"
import type { RequestHandler, RequestHandlerWithInput, TaggedRequestClassAny } from "effect-app/client/clientFor"
import { tuple } from "effect-app/Function"
import type { ComputedRef, Ref } from "vue"
import { computed, ref, shallowRef } from "vue"
import { reportRuntimeError } from "./lib.js"
import { getQueryKey } from "./mutate.js"

export type WatchSource<T = any> = Ref<T> | ComputedRef<T> | (() => T)
export function make<A, E, R>(self: Effect<A, E, R>) {
  const result = shallowRef(Result.initial() as Result.Result<A, E>)

  const execute = Effect
    .sync(() => {
      result.value = Result.waiting(result.value)
    })
    .pipe(
      Effect.andThen(self),
      Effect.exit,
      Effect.andThen(Result.fromExit),
      Effect.flatMap((r) => Effect.sync(() => result.value = r))
    )

  const latestSuccess = computed(() => Option.getOrUndefined(Result.value(result.value)))

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

export type MutationResult<A, E> = MutationInitial | MutationLoading | MutationSuccess<A> | MutationError<E>

export type MaybeRef<T> = Ref<T> | ComputedRef<T> | T
type MaybeRefDeep<T> = MaybeRef<
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  T extends Function ? T
    : T extends object ? {
        [Property in keyof T]: MaybeRefDeep<T[Property]>
      }
    : T
>

export interface MutationOptions<A, I = void> {
  queryInvalidation?: (defaultKey: string[], name: string) => {
    filters?: MaybeRefDeep<InvalidateQueryFilters> | undefined
    options?: MaybeRefDeep<InvalidateOptions> | undefined
  }[]
  /** @deprecated use mapHandler with Effect.andThen/tap accordingly */
  onSuccess?: (a: A, i: I) => Promise<unknown>
}

// TODO: more efficient invalidation, including args etc
// return Effect.promise(() => queryClient.invalidateQueries({
//   predicate: (_) => nses.includes(_.queryKey.filter((_) => _.startsWith("$")).join("/"))
// }))
/*
            // const nses: string[] = []
                // for (let i = 0; i < ns.length; i++) {
                //   nses.push(ns.slice(0, i + 1).join("/"))
                // }
                */

export const makeMutation2 = () => {
  /**
   * Pass a function that returns an Effect, e.g from a client action, or an Effect
   * Returns a tuple with state ref and execution function which reports errors as Toast.
   */
  const useSafeMutation: {
    <I, E, A, R, Request extends TaggedRequestClassAny>(
      self: RequestHandlerWithInput<I, A, E, R, Request>,
      options?: MutationOptions<A, I>
    ): readonly [
      Readonly<Ref<MutationResult<A, E>>>,
      (i: I) => Effect<A, E, R>
    ]
    <E, A, R, Request extends TaggedRequestClassAny>(
      self: RequestHandler<A, E, R, Request>,
      options?: MutationOptions<A>
    ): readonly [
      Readonly<Ref<MutationResult<A, E>>>,
      () => Effect<A, E, R> // TODO: remove () =>
    ]
  } = <I, E, A, R, Request extends TaggedRequestClassAny>(
    self: RequestHandlerWithInput<I, A, E, R, Request> | RequestHandler<A, E, R, Request>,
    options?: MutationOptions<A, I>
  ) => {
    const queryClient = useQueryClient()
    const state: Ref<MutationResult<A, E>> = ref<MutationResult<A, E>>({ _tag: "Initial" }) as any

    const invalidateQueries = (
      filters?: MaybeRefDeep<InvalidateQueryFilters>,
      options?: MaybeRefDeep<InvalidateOptions>
    ) => Effect.promise(() => queryClient.invalidateQueries(filters, options))

    function handleExit(exit: Exit.Exit<A, E>) {
      return Effect.sync(() => {
        if (Exit.isSuccess(exit)) {
          state.value = { _tag: "Success", data: exit.value }
          return
        }

        const err = Cause.failureOption(exit.cause)
        if (Option.isSome(err)) {
          state.value = { _tag: "Error", error: err.value }
          return
        }
      })
    }

    const invalidateCache = Effect.suspend(() => {
      const queryKey = getQueryKey(self)

      if (options?.queryInvalidation) {
        const opts = options.queryInvalidation(queryKey, self.name)
        if (!opts.length) {
          return Effect.void
        }
        return Effect
          .andThen(
            Effect.annotateCurrentSpan({ queryKey, opts }),
            Effect.forEach(opts, (_) => invalidateQueries(_.filters, _.options), { concurrency: "inherit" })
          )
          .pipe(Effect.withSpan("client.query.invalidation", { captureStackTrace: false }))
      }

      if (!queryKey) return Effect.void

      return Effect
        .andThen(
          Effect.annotateCurrentSpan({ queryKey }),
          invalidateQueries({ queryKey })
        )
        .pipe(Effect.withSpan("client.query.invalidation", { captureStackTrace: false }))
    })

    const onSuccess = options?.onSuccess

    const exec = (fst?: I) => {
      let effect: Effect<A, E, R>
      if (Effect.isEffect(self.handler)) {
        effect = self.handler as any
      } else {
        effect = self.handler(fst as I)
      }

      return Effect
        .sync(() => {
          state.value = { _tag: "Loading" }
        })
        .pipe(
          Effect.zipRight(effect),
          Effect.tapBoth({ onFailure: () => invalidateCache, onSuccess: () => invalidateCache }),
          Effect.tap((a) => onSuccess ? Effect.promise(() => onSuccess(a, fst as I)) : Effect.void),
          Effect.tapDefect(reportRuntimeError),
          Effect.onExit(handleExit),
          Effect.withSpan(`mutation ${self.name}`, { captureStackTrace: false })
        )
    }

    return tuple(
      state,
      exec
    )
  }
  return useSafeMutation
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MakeMutation2 extends ReturnType<typeof makeMutation2> {}
