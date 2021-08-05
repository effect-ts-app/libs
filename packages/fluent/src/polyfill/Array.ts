import {
  append_,
  concat_,
  filter_,
  filterMap_,
  findFirst_,
  findFirstMap_,
  flatten,
  map_,
  mapWithIndex_,
  toMutable,
} from "@effect-ts-app/core/Array"
import {
  collectAll,
  forEach_,
  forEachPar_,
  forEachParN_,
} from "@effect-ts-app/core/Effect"

import { sort_, sortBy_, uniq_ } from "../_ext/Array"

const BasePrototype = Array.prototype as any

const funcs = {
  mutable: toMutable,
  mapRA: map_,
  mapWithIndex: mapWithIndex_,
  concatRA: concat_,
  filterMap: filterMap_,
  findFirst: findFirst_,
  findFirstMap: findFirstMap_,
  filterRA: filter_,
  sortWith: sort_,
  sortBy: sortBy_,
  uniq: uniq_,
  append: append_,
  flatten,

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
