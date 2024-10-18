import { type Pausable, useIntervalFn, type UseIntervalFnOptions } from "@vueuse/core"
import type { Runtime, S } from "effect-app"
import type { MaybeRefOrGetter, ShallowRef } from "vue"

export * as Result from "@effect-rx/rx/Result"

export type TaggedRequestClassAny = S.Schema.Any & {
  readonly _tag: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly success: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly failure: any
}

export function pauseWhileProcessing(
  iv: Pausable,
  pmf: () => Promise<unknown>
) {
  return Promise
    .resolve(iv.pause())
    .then(() => pmf())
    .finally(() => iv.resume())
}

export function useIntervalPauseWhileProcessing(
  pmf: () => Promise<unknown>,
  interval?: MaybeRefOrGetter<number>,
  options?: Omit<UseIntervalFnOptions, "immediateCallback">
) {
  const iv = useIntervalFn(
    () => pauseWhileProcessing(iv, pmf),
    interval,
    options ? { ...options, immediateCallback: false } : options
  )
  return {
    isActive: iv.isActive
  }
}

export const getRuntime = <R>(runtime: ShallowRef<Runtime.Runtime<R> | undefined>) => {
  if (!runtime.value) throw new Error("Effect runtime not set")
  return runtime.value
}
