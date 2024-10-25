import { type Pausable, useIntervalFn, type UseIntervalFnOptions } from "@vueuse/core"
import { type Effect, pipe, type Runtime } from "effect-app"
import type { RequestHandler, RequestHandlerWithInput, TaggedRequestClassAny } from "effect-app/client/clientFor"
import type { MaybeRefOrGetter, ShallowRef } from "vue"
import { reportError } from "./errorReporter.js"

export * as Result from "@effect-rx/rx/Result"

export const reportRuntimeError = reportError("Runtime")

// $Project/$Configuration.Index
// -> "$Project", "$Configuration", "Index"
export const makeQueryKey = ({ name }: { name: string }) =>
  pipe(name.split("/"), (split) => split.map((_) => "$" + _))
    .join(".")
    .split(".")

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

export const mapHandler: {
  <I, E, R, A, E2, A2, R2, Request extends TaggedRequestClassAny>(
    self: RequestHandlerWithInput<I, A, E, R, Request>,
    map: (handler: (i: I) => Effect<A, E, R>) => (i: I) => Effect<A2, E2, R2>
  ): RequestHandlerWithInput<I, A2, E2, R2, Request>
  <E, A, R, E2, A2, R2, Request extends TaggedRequestClassAny>(
    self: RequestHandler<A, E, R, Request>,
    map: (handler: Effect<A, E, R>) => Effect<A2, E2, R2>
  ): RequestHandler<A2, E2, R2, Request>
} = (self: any, map: any): any => ({
  ...self,
  handler: typeof self.handler === "function"
    ? (i: any) => map(self.handler as (i: any) => Effect<any, any, any>)(i)
    : map(self.handler)
})
