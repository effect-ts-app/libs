import { pipe } from "@effect-ts/core"
import * as T from "@effect-ts-app/core/Effect"

import { applyFunctions, makeAutoFuncs } from "./util"

const exceptions = {
  provideSomeLayer_: "inject",
  trace: null,
  forkScope: null,
  left: null,
  right: null,
}

const funcs = {
  ...makeAutoFuncs(T, exceptions),
}

const BasePrototype = T.Base.prototype as any
applyFunctions(funcs, BasePrototype, "Effect")
BasePrototype.pipe = function (...args: [any]) {
  return pipe(this, ...args)
}
