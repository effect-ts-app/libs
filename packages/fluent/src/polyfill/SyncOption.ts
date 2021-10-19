import { XPureBase } from "@effect-ts/system/XPure"
import {
  alt_,
  chain_,
  chainSync_,
  getOrElse_,
  getOrFail_,
  map_,
  toNullable,
} from "@effect-ts-app/core/SyncOption"

const BasePrototype = XPureBase.prototype as any

const funcs = {
  chainOption: chain_,
  alt: alt_,
  getOrElse: getOrElse_,
  mapOption: map_,
  chainOptionSync: chainSync_,
  getOrFail: getOrFail_,
  toNullable,
}

Object.entries(funcs).forEach(([k, v]) => {
  const f = v as any
  BasePrototype[k] = function (...args: [any]) {
    return f(this, ...args)
  }
})
