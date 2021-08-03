import * as CNK from "@effect-ts/core/Collections/Immutable/Chunk"
import {
  collectAll,
  forEach_,
  forEachPar_,
  forEachParN_,
} from "@effect-ts-app/core/Effect"

const BasePrototype = CNK.ChunkInternal.prototype as any

const funcs = {
  toArray: CNK.toArray,
  //mapWithIndex: CNK.mapWithIndex_,
  filterMap: CNK.filterMap_,
  filter: CNK.filter_,
  map: CNK.map_,
  //findFirst: CNK.findFirst_,
  //findFirstMap: CNK.findFirstMap_,
  //sortWith: CNK.sort_,
  //sortBy: CNK.sortBy_,
  //uniq: CNK.uniq_,

  // IterableOps
  collectAll,
  forEachParN: forEachParN_,
  forEachPar: forEachPar_,
  forEachEff: forEach_,
}

Object.entries(funcs).forEach(([k, v]) => {
  const f = v as any
  BasePrototype[k] = function (...args: [any]) {
    return f(this, ...args)
  }
})
