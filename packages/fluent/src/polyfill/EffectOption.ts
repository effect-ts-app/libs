import { Base } from "@effect-ts/core/Effect"
import {
  alt_,
  chain_,
  chainEffect_,
  getOrElse_,
  getOrFail_,
  map_,
  toNullable,
} from "@effect-ts-app/core/EffectOption"

const BasePrototype = Base.prototype as any

const funcs = {
  chainOption: chain_,
  alt: alt_,
  getOrElse: getOrElse_,
  mapOption: map_,
  chainOptionEffect: chainEffect_,
  toNullable,
  getOrFail: getOrFail_,
}

Object.entries(funcs).forEach(([k, v]) => {
  const f = v as any
  BasePrototype[k] = function (...args: [any]) {
    return f(this, ...args)
  }
})
