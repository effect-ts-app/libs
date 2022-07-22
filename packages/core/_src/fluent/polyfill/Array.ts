import { from } from "@effect-ts/core/Collections/Immutable/Chunk"
import * as ARR from "@effect-ts-app/core/Array"
import {
  collectAll,
  forEach_,
  forEachPar_,
  forEachParN_,
} from "@effect-ts-app/core/Effect"
import {
  collectAll as collectAllSync,
  forEach_ as forEachSync,
} from "@effect-ts-app/core/Sync"

import { sort_, sortBy_, uniq_ } from "../_ext/Array.js"
import { mapM } from "../_ext/mapM.js"
import { mapEither_, mapMaybe_ } from "../fluent/Array.js"
import { applyFunctions, makeAutoFuncs } from "./util.js"

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
  mapM, // works differently than the original one, for Maybe and Sync.
  toChunk: from,
  mapEither: mapEither_,
  mapMaybe: mapMaybe_,

  // IterableOps
  collectAll,
  forEachParN: forEachParN_,
  forEachPar: forEachPar_,
  forEachEffect: forEach_,
  collectAllSync,
  forEachSync,
}

applyFunctions(funcs, BasePrototype, "Array")
