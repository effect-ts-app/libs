import { pipe } from "@effect-ts/core"
import * as Option from "@effect-ts/core/Option"
import { tryCatchOption_ } from "@effect-ts/core/Sync"
import { encaseOption_ } from "@effect-ts-app/core/Effect"

import { alt_ } from "../_ext/Option"
import { makeAutoFuncs } from "./util"

const exceptions = {}

const funcs = {
  ...makeAutoFuncs(Option, exceptions),

  // custom
  alt: alt_,
  encaseInSync: tryCatchOption_,
  encaseInEffect: encaseOption_,
  pipe,
}

function apply(BasePrototype: any) {
  // getters
  if (!BasePrototype.val) {
    Object.defineProperty(BasePrototype, "val", {
      get() {
        return Option.toNullable(this)
      },
      enumerable: false,
      configurable: true,
    })
  }

  // functions
  Object.entries(funcs).forEach(([k, v]) => {
    const f = v as any
    BasePrototype[k] = function (...args: [any]) {
      return f(this, ...args)
    }
  })
}

apply(Option.None.prototype)
apply(Option.Some.prototype)
