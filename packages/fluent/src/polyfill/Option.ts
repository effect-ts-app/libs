import { pipe } from "@effect-ts/core"
import {
  chain_,
  fold_,
  isNone,
  isSome,
  map_,
  None,
  Some,
  toNullable,
} from "@effect-ts/core/Option"

import { alt_ } from "../_ext/Option"

const funcs = {
  alt: alt_,
  fold: fold_,
}

function apply(BasePrototype: any) {
  if (!BasePrototype.val) {
    Object.defineProperty(BasePrototype, "val", {
      get() {
        return toNullable(this)
      },
      enumerable: false,
      configurable: true,
    })
  }

  Object.entries(funcs).forEach(([k, v]) => {
    const f = v as any
    BasePrototype[k] = function (...args: [any]) {
      return f(this, ...args)
    }
  })

  // this overlaps with the real value object
  // should not be needed
  // Object.defineProperty(BasePrototype, "value", {
  //   get() {
  //     return toUndefined(this)
  //   },
  //   enumerable: false,
  // })

  BasePrototype.chain = function (...args: [any]) {
    return chain_(this, ...args)
  }

  BasePrototype.isSome = function () {
    return isSome(this)
  }

  BasePrototype.isSome = function () {
    return isSome(this)
  }

  BasePrototype.isNone = function () {
    return isNone(this)
  }

  BasePrototype.map = function (...args: [any]) {
    return map_(this, ...args)
  }

  BasePrototype.pipe = function (...args: [any]) {
    return pipe(this, ...args)
  }
}

apply(None.prototype)
apply(Some.prototype)
