import { pipe } from "@effect-ts/core"
import * as MAN from "@effect-ts/core/Effect/Managed"

import { makeAutoFuncs } from "./util"

const BasePrototype = MAN.ManagedImpl.prototype as any

const exceptions = {}

const funcs = {
  ...makeAutoFuncs(MAN, exceptions),
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
