import { pipe } from "@effect-ts/core"
import {
  chain_,
  fold_,
  getLeft,
  getOrElse_,
  getRight,
  isLeft,
  isRight,
  Left,
  map_,
  Right,
} from "@effect-ts/core/Either"
import { encaseEither } from "@effect-ts-app/core/Effect"
import { identity } from "@effect-ts-app/core/Function"
import { encaseEither as encaseEitherInSync } from "@effect-ts-app/core/Sync"

import { alt_ } from "../_ext/Option"

const funcs = {
  alt: alt_,
  fold: fold_,
  encaseInSync: encaseEitherInSync,
  encaseInEffect: encaseEither,
  getOrElse: getOrElse_,
  chain: chain_,
  isRight,
  isLeft,
  map: map_,
  pipe,
  widenLeft: identity,
  widenRight: identity,
}

function apply(BasePrototype: any) {
  if (!BasePrototype.getLeft) {
    Object.defineProperty(BasePrototype, "getLeft", {
      get() {
        return getLeft(this)
      },
      enumerable: false,
      configurable: true,
    })
    Object.defineProperty(BasePrototype, "getRight", {
      get() {
        return getRight(this)
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

apply(Left.prototype)
apply(Right.prototype)
