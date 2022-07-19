import { filter_, some_ } from "@effect-ts/core/Collections/Immutable/Set"
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

import { find_, findFirst_, findFirstMap_ } from "../_ext/Set.js"
import { applyFunctions } from "./util.js"

const BasePrototype = Set.prototype as any

const funcs = {
  // custom
  filter: filter_,
  findFirstMap: findFirstMap_,
  findFirst: findFirst_,
  find: find_,

  some: some_,

  // IterableOps
  collectAll,
  forEachParN: forEachParN_,
  forEachPar: forEachPar_,
  forEachEffect: forEach_,
  collectAllSync,
  forEachSync,
}

applyFunctions(funcs, BasePrototype, "Set")
