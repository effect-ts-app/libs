import { pipe } from "@effect-ts/core"
import { tryCatchOption_ } from "@effect-ts/core/Sync"
import { encaseMaybe_ } from "@effect-ts-app/core/Effect"
import * as Maybe from "@effect-ts-app/core/Maybe"

import { alt_ } from "../_ext/Maybe.js"
import { applyFunctions, makeAutoFuncs } from "./util.js"

const exceptions: Partial<Record<keyof typeof Maybe, string | null>> = {
  none: null,
  some: null,
}

const funcs = {
  ...makeAutoFuncs(Maybe, exceptions),

  // custom
  alt: alt_,
  encaseInSync: tryCatchOption_,
  encaseInEffect: encaseMaybe_,
  pipe,
}

function apply(BasePrototype: any) {
  // getters
  if (!BasePrototype.val) {
    Object.defineProperty(BasePrototype, "val", {
      get() {
        return Maybe.toNullable(this)
      },
      enumerable: false,
      configurable: true,
    })
  }

  // functions
  applyFunctions(funcs, BasePrototype, "Maybe")
}

apply(Maybe.None.prototype)
apply(Maybe.Some.prototype)
