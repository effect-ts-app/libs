import * as ARR from "@effect-ts/core/Collections/Immutable/Array"
import {
  collectAll,
  forEach_,
  forEachPar_,
  forEachParN_,
} from "@effect-ts-app/core/Effect"

import * as ARR2 from "../_ext/Array"

const BasePrototype = Array.prototype as any

const funcs = {
  mutable: ARR.toMutable,
  mapRA: ARR.map_,
  mapWithIndex: ARR.mapWithIndex_,
  concatRA: ARR.concat_,
  filterMap: ARR.filterMap_,
  findFirst: ARR.findFirst_,
  findFirstMap: ARR.findFirstMap_,
  filterRA: ARR.filter_,
  sortWith: ARR2.sort_,
  sortBy: ARR2.sortBy_,
  uniq: ARR2.uniq_,
  append: ARR2.append_,

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
