import type { EffectUnunified } from "@effect-app/prelude/_ext/allLowerFirst"
import type { Ref } from "vue"
import { ref } from "vue"

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
