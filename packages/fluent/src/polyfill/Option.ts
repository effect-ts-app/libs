import { pipe } from "@effect-ts/core"
import {
  chain_,
  fold_,
  getOrElse_,
  isNone,
  isSome,
  map_,
  None,
  Some,
  toNullable,
} from "@effect-ts/core/Option"
import { tryCatchOption_ } from "@effect-ts/core/Sync"
import { encaseOption_ } from "@effect-ts-app/core/Effect"

import { alt_ } from "../_ext/Option"

const funcs = {
  alt: alt_,
  fold: fold_,
  encaseInSync: tryCatchOption_,
  encaseInEffect: encaseOption_,
  getOrElse: getOrElse_,
  chain: chain_,
  isSome,
  isNone,
  map: map_,
  pipe,
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
}

apply(None.prototype)
apply(Some.prototype)
