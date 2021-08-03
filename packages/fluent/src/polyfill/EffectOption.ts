import { Base } from "@effect-ts/core/Effect"
import {
  chain_,
  chainEffect_,
  map_,
  toNullable,
} from "@effect-ts-app/core/EffectOption"

const BasePrototype = Base.prototype as any

const funcs = {
  chainOption: chain_,
  mapOption: map_,
  chainOptionEffect: chainEffect_,
  toNullable,
}

Object.entries(funcs).forEach(([k, v]) => {
  const f = v as any
  BasePrototype[k] = function (...args: [any]) {
    return f(this, ...args)
  }
})
