import { from } from "@effect-ts/core/Collections/Immutable/Chunk"
import { mapEither_, mapOption_ } from "@effect-ts/fluent/Fx/Array"
import * as ARR from "@effect-ts-app/core/Array"
import {
  collectAll,
  forEach_,
  forEachPar_,
  forEachParN_,
} from "@effect-ts-app/core/Effect"

import { sort_, sortBy_, uniq_ } from "../_ext/Array"
import { mapM } from "../_ext/mapM"
import { makeAutoFuncs } from "./util"

const BasePrototype = Array.prototype as any

const exceptions = {
  // should not overwrite built-in!
  map_: "mapRA",
  concat_: "concatRA",
  sort_: "sortWith",
  forEach_: "forEachRA",
  filter_: "filterRA",
  flatten: "flattenRA",

  // name changes
  toMutable: "mutable",
}

const funcs = {
  ...makeAutoFuncs(ARR, exceptions),

  // custom
  sortWith: sort_,
  sortBy: sortBy_,
  uniq: uniq_,
  mapM, // works differently than the original one, for Option and Sync.
  toChunk: from,
  mapEither: mapEither_,
  mapOption: mapOption_,

  // IterableOps
  collectAll,
  forEachParN: forEachParN_,
  forEachPar: forEachPar_,
  forEachEff: forEach_,
}

Object.entries(funcs).forEach(([k, v]) => {
  const f = v as any
  Object.defineProperty(BasePrototype, k, {
    enumerable: false,
    configurable: true,
    value(...args: [any]) {
      return f(this, ...args)
    },
  })
})
