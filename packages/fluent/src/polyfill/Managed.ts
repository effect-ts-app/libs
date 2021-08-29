import { pipe } from "@effect-ts/core"
import {
  asUnit,
  catchAll_,
  chain_,
  fold_,
  fork,
  Managed as Base,
  map_,
  mapError_,
  orDie,
  result,
  tap_,
  tapBoth_,
  tapCause_,
  tapError_,
  zipRight_,
} from "@effect-ts/core/Effect/Managed"

const BasePrototype = Base.prototype as any

const funcs = {
  catchAll: catchAll_,
  chain: chain_,
  fold: fold_,
  fork,
  map: map_,
  mapError: mapError_,
  tap: tap_,
  tapCause: tapCause_,
  tapError: tapError_,
  tapBoth: tapBoth_,
  result,
  orDie,
  zipRight: zipRight_,
  asUnit,
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
