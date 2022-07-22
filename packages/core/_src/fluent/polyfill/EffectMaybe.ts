import { Base } from "@effect-ts/core/Effect"
import {
  alt_,
  chain_,
  chainEffect_,
  getOrElse_,
  getOrFail_,
  map_,
  toNullable,
} from "@effect-ts-app/core/EffectMaybe"

import { applyFunctions } from "./util.js"

const BasePrototype = Base.prototype as any

const funcs = {
  flatMapMaybe: chain_,
  alt: alt_,
  getOrElse: getOrElse_,
  mapMaybe: map_,
  flatMapMaybeEffect: chainEffect_,
  toNullable,
  getOrFail: getOrFail_,
}

applyFunctions(funcs, BasePrototype, "EffectMaybe")
