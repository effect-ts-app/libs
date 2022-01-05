import { pipe } from "@effect-ts/core"
import * as T from "@effect-ts-app/core/Effect"

import { makeAutoFuncs } from "./util"

const exceptions = {
  provideSomeLayer_: "inject",
}

const funcs = {
  ...makeAutoFuncs(T, exceptions),
}

const BasePrototype = T.Base.prototype as any
Object.entries(funcs).forEach(([k, v]) => {
  const f = v as any
  BasePrototype[k] = function (...args: [any]) {
    return f(this, ...args)
  }
})

BasePrototype.pipe = function (...args: [any]) {
  return pipe(this, ...args)
}
