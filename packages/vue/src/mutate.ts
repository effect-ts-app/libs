/* eslint-disable @typescript-eslint/no-explicit-any */
import { tuple } from "@effect-app/core/Function"
import type * as HttpClient from "@effect/platform/Http/Client"
import { useQueryClient } from "@tanstack/vue-query"
import { Cause, Effect, Exit, Fiber, Option } from "effect-app"
import { hasValue, Initial, isInitializing, Loading, queryResult, Refreshing } from "effect-app/client"
import type { ApiConfig, FetchResponse, QueryResult } from "effect-app/client"
import { InterruptedException } from "effect/Cause"
import * as Either from "effect/Either"
import type { ComputedRef, Ref } from "vue"
import { computed, ref, shallowRef } from "vue"
import { makeQueryKey, run } from "./internal.js"

export type WatchSource<T = any> = Ref<T> | ComputedRef<T> | (() => T)
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
export const useSafeMutation: {
  <I, E, A>(self: { handler: (i: I) => Effect<A, E, ApiConfig | HttpClient.Client.Default>; name: string }): readonly [
    Readonly<Ref<MutationResult<E, A>>>,
    (
      i: I,
      abortSignal?: AbortSignal
    ) => Promise<Either.Either<A, E>>
  ]
  <E, A>(self: { handler: Effect<A, E, ApiConfig | HttpClient.Client.Default>; name: string }): readonly [
    Readonly<Ref<MutationResult<E, A>>>,
    (
      abortSignal?: AbortSignal
    ) => Promise<Either.Either<A, E>>
  ]
} = <I, E, A>(
  self: {
    handler:
      | ((i: I) => Effect<A, E, ApiConfig | HttpClient.Client.Default>)
      | Effect<A, E, ApiConfig | HttpClient.Client.Default>
    name: string
  }
) => {
  const queryClient = useQueryClient()
  const state: Ref<MutationResult<E, A>> = ref<MutationResult<E, A>>({ _tag: "Initial" }) as any

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
        .tap(() =>
          Effect.suspend(() => {
            const key = makeQueryKey(self.name)
            const ns = key.filter((_) => _.startsWith("$"))
            const nses: string[] = []
            for (let i = 0; i < ns.length; i++) {
              nses.push(ns.slice(0, i + 1).join("/"))
            }
            return Effect.promise(() => queryClient.invalidateQueries({ queryKey: [ns[0]] }))
            // TODO: more efficient invalidation, including args etc
            // return Effect.promise(() => queryClient.invalidateQueries({
            //   predicate: (_) => nses.includes(_.queryKey.filter((_) => _.startsWith("$")).join("/"))
            // }))
          })
        )
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
