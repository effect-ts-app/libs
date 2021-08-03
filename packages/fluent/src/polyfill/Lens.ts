import * as Lens from "../_ext/Lens"

const BasePrototype = Array.prototype as any

const funcs = {
  modify: Lens.modify_,
  prop: Lens.prop_,
}

Object.entries(funcs).forEach(([k, v]) => {
  const f = v as any
  BasePrototype[k] = function (...args: [any]) {
    return f(this, ...args)
  }
})
