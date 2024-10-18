import { type Pausable, useIntervalFn, type UseIntervalFnOptions } from "@vueuse/core"
import type { MaybeRefOrGetter } from "vue"

export * as Result from "@effect-rx/rx/Result"

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
