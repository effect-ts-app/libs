/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Result from "@effect-rx/rx/Result"
import type { InvalidateOptions, InvalidateQueryFilters } from "@tanstack/vue-query"
import { useQueryClient } from "@tanstack/vue-query"
import { Cause, Effect, Exit, Option, Runtime } from "effect-app"
import { tuple } from "effect-app/Function"
import { dropUndefinedT } from "effect-app/utils"
import { InterruptedException } from "effect/Cause"
import * as Either from "effect/Either"
import type { ComputedRef, Ref, ShallowRef } from "vue"
import { computed, ref, shallowRef } from "vue"
import { getRuntime, makeQueryKey, reportRuntimeError } from "./lib.js"

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

export const getQueryKey = (h: { name: string }) => {
  const key = makeQueryKey(h)
  const ns = key.filter((_) => _.startsWith("$"))
  // we invalidate the parent namespace e.g $project/$configuration.get, we invalidate $project
  // for $project/$configuration/$something.get, we invalidate $project/$configuration
  const k = ns.length ? ns.length > 1 ? ns.slice(0, ns.length - 1) : ns : undefined
  if (!k) throw new Error("empty query key for: " + h.name)
  return k
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

export const makeMutation = <R>(runtime: ShallowRef<Runtime.Runtime<R> | undefined>) => {
  type HandlerWithInput<I, A, E> = {
    handler: (i: I) => Effect<A, E, R>
    name: string
  }
  type Handler<A, E> = { handler: Effect<A, E, R>; name: string }

  /**
   * Pass a function that returns an Effect, e.g from a client action, or an Effect
   * Returns a tuple with state ref and execution function which reports errors as Toast.
   */
  const useSafeMutation: {
    <I, E, A>(self: HandlerWithInput<I, A, E>, options?: MutationOptions<A, I>): readonly [
      Readonly<Ref<MutationResult<A, E>>>,
      (
        i: I,
        signal?: AbortSignal
      ) => Promise<Either.Either<A, E>>
    ]
    <E, A>(self: Handler<A, E>, options?: MutationOptions<A>): readonly [
      Readonly<Ref<MutationResult<A, E>>>,
      (
        signal?: AbortSignal
      ) => Promise<Either.Either<A, E>>
    ]
  } = <I, E, A>(
    self: {
      handler:
        | HandlerWithInput<I, A, E>["handler"]
        | Handler<A, E>["handler"]
      name: string
    },
    options?: MutationOptions<A>
  ) => {
    const runPromise = Runtime.runPromise(getRuntime(runtime))

    const queryClient = useQueryClient()
    const state: Ref<MutationResult<A, E>> = ref<MutationResult<A, E>>({ _tag: "Initial" }) as any
    const onSuccess = options?.onSuccess

    const invalidateQueries = (
      filters?: MaybeRefDeep<InvalidateQueryFilters>,
      options?: MaybeRefDeep<InvalidateOptions>
    ) => Effect.promise(() => queryClient.invalidateQueries(filters, options))

    function handleExit(exit: Exit.Exit<A, E>): Effect<Either.Either<A, E>, never, never> {
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
      let effect: Effect<A, E, R>
      let signal: AbortSignal | undefined
      if (Effect.isEffect(self.handler)) {
        effect = self.handler as any
        signal = fst as AbortSignal | undefined
      } else {
        effect = self.handler(fst as I)
        signal = snd
      }

      const invalidateCache = Effect
        .suspend(() => {
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

      return runPromise(
        Effect
          .sync(() => {
            state.value = { _tag: "Loading" }
          })
          .pipe(
            Effect.andThen(effect),
            Effect.tapBoth({ onFailure: () => invalidateCache, onSuccess: () => invalidateCache }),
            Effect.tap((a) =>
              onSuccess ? Effect.promise(() => onSuccess(a, (fst !== signal ? fst : undefined) as any)) : Effect.void
            ),
            Effect.tapDefect(reportRuntimeError),
            Effect.exit,
            Effect.flatMap(handleExit),
            Effect.withSpan(`mutation ${self.name}`, { captureStackTrace: false })
          ),
        dropUndefinedT({ signal })
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
export interface MakeMutation<R> extends ReturnType<typeof makeMutation<R>> {}

export function mutationResultToVue<A, E>(
  mutationResult: MutationResult<A, E>
): Res<A, E> {
  switch (mutationResult._tag) {
    case "Loading": {
      return { loading: true, data: undefined, error: undefined }
    }
    case "Success": {
      return {
        loading: false,
        data: mutationResult.data,
        error: undefined
      }
    }
    case "Error": {
      return {
        loading: false,
        data: undefined,
        error: mutationResult.error
      }
    }
    case "Initial": {
      return { loading: false, data: undefined, error: undefined }
    }
  }
}

export interface Res<A, E> {
  readonly loading: boolean
  readonly data: A | undefined
  readonly error: E | undefined
}
