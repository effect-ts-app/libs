import { XPureBase } from "@effect-ts/system/XPure"
import {
  alt_,
  chain_,
  chainSync_,
  getOrElse_,
  getOrFail_,
  map_,
  toNullable,
} from "@effect-ts-app/core/SyncOption"

import { applyFunctions } from "./util.js"

const BasePrototype = XPureBase.prototype as any

const funcs = {
  chainOption: chain_,
  alt: alt_,
  getOrElse: getOrElse_,
  mapOption: map_,
  chainOptionSync: chainSync_,
  getOrFail: getOrFail_,
  toNullable,
}

applyFunctions(funcs, BasePrototype, "SyncOption")
