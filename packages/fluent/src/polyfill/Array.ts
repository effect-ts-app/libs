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
import { applyFunctions, makeAutoFuncs } from "./util"

const BasePrototype = Array.prototype as any

const exceptions: Partial<Record<keyof typeof ARR, string | null>> = {
  // should not overwrite built-in!
  map_: "mapRA",
  concat_: "concatRA",
  //forEach_: "forEachRA", // no longer exists?
  filter_: "filterRA",
  reduce_: "reduceRA",
  find_: "findFirst",

  sort: null,
  // overwrites are not applied anyway atm
  // includes_: null,
  // join_: null,

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

applyFunctions(funcs, BasePrototype, "Array")
