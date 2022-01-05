import { pipe } from "@effect-ts/core"
import * as Ei from "@effect-ts/core/Either"
import { encaseEither } from "@effect-ts-app/core/Effect"
import { identity } from "@effect-ts-app/core/Function"
import { encaseEither as encaseEitherInSync } from "@effect-ts-app/core/Sync"

import { alt_ } from "../_ext/Option"
import { applyFunctions, makeAutoFuncs } from "./util"

const exceptions = {}

const funcs = {
  ...makeAutoFuncs(Ei, exceptions),

  // custom
  alt: alt_,
  encaseInSync: encaseEitherInSync,
  encaseInEffect: encaseEither,
  pipe,
  widenLeft: identity,
  widenRight: identity,
}

function apply(BasePrototype: any) {
  // getters
  if (!BasePrototype.getLeft) {
    Object.defineProperty(BasePrototype, "getLeft", {
      get() {
        return Ei.getLeft(this)
      },
      enumerable: false,
      configurable: true,
    })
    Object.defineProperty(BasePrototype, "getRight", {
      get() {
        return Ei.getRight(this)
      },
      enumerable: false,
      configurable: true,
    })
  }
  // functions
  applyFunctions(funcs, BasePrototype, "Either")
}

apply(Ei.Left.prototype)
apply(Ei.Right.prototype)
