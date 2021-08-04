import { Lens } from "@effect-ts/monocle/Lens"

import { modify_, prop_ } from "../_ext/Lens"

const BasePrototype = Lens.prototype as any

const funcs = {
  modify: modify_,
  prop: prop_,
}

Object.entries(funcs).forEach(([k, v]) => {
  const f = v as any
  BasePrototype[k] = function (...args: [any]) {
    return f(this, ...args)
  }
})
