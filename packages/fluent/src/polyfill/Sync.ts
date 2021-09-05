import { pipe } from "@effect-ts/core"
import {
  asUnit,
  catchAll_,
  catchTag_,
  delay_,
  fold_,
  forever,
  fork,
  forkDaemon,
  forkDaemonReport_,
  forkManaged,
  orDie,
  provideSomeLayer_,
  result,
  runPromise,
  runPromiseExit,
  tap_,
  tapBoth_,
  tapCause_,
  tapError_,
  union,
  zipRight_,
} from "@effect-ts/core/Effect"
import { XPureBase } from "@effect-ts/system/XPure"
import { tapBothInclAbort_ } from "@effect-ts-app/core/Effect"
import { chain_, map_, mapError_, toEffect } from "@effect-ts-app/core/Sync"

const BasePrototype = XPureBase.prototype as any

const funcs = {
  toEffect,
  catchAll: catchAll_,
  delay: delay_,
  chain: chain_,
  fold: fold_,
  forever,
  forkManaged,
  fork,
  forkDaemon,
  forkDaemonReport: forkDaemonReport_,
  map: map_,
  mapError: mapError_,
  tap: tap_,
  tapCause: tapCause_,
  tapError: tapError_,
  tapBoth: tapBoth_,
  tapBothInclAbort: tapBothInclAbort_,
  result,
  orDie,
  catchTag: catchTag_,
  zipRight: zipRight_,
  inject: provideSomeLayer_,
  asUnit,
  union,

  runPromise,
  runPromiseExit,
}

Object.entries(funcs).forEach(([k, v]) => {
  const f = v as any
  BasePrototype[k] = function (...args: [any]) {
    return f(this, ...args)
  }
})

BasePrototype.pipe = function (...args: [any]) {
  return pipe(this, ...args)
}
