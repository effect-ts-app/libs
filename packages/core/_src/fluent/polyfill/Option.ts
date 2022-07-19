import { pipe } from "@effect-ts/core"
import * as Option from "@effect-ts/core/Option"
import { tryCatchOption_ } from "@effect-ts/core/Sync"
import { encaseOption_ } from "@effect-ts-app/core/Effect"

import { alt_ } from "../_ext/Option.js"
import { applyFunctions, makeAutoFuncs } from "./util.js"

const exceptions: Partial<Record<keyof typeof Option, string | null>> = {
  none: null,
  some: null,
}

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
  applyFunctions(funcs, BasePrototype, "Option")
}

apply(Option.None.prototype)
apply(Option.Some.prototype)
