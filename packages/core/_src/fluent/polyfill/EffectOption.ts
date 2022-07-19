import { Base } from "@effect-ts/core/Effect"
import {
  alt_,
  chain_,
  chainEffect_,
  getOrElse_,
  getOrFail_,
  map_,
  toNullable,
} from "@effect-ts-app/core/EffectOption"

import { applyFunctions } from "./util.js"

const BasePrototype = Base.prototype as any

const funcs = {
  flatMapOption: chain_,
  alt: alt_,
  getOrElse: getOrElse_,
  mapOption: map_,
  flatMapOptionEffect: chainEffect_,
  toNullable,
  getOrFail: getOrFail_,
}

applyFunctions(funcs, BasePrototype, "EffectOption")
