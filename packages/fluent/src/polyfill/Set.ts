import { filter_, some_ } from "@effect-ts/core/Collections/Immutable/Set"
import {
  collectAll,
  forEach_,
  forEachPar_,
  forEachParN_,
} from "@effect-ts-app/core/Effect"

import { find_, findFirst_, findFirstMap_ } from "../_ext/Set"
import { applyFunctions } from "./util"

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
  forEachEff: forEach_,
}

applyFunctions(funcs, BasePrototype, "Set")
