import { XPureBase } from "@effect-ts/system/XPure"
import {
  alt_,
  chain_,
  chainSync_,
  getOrElse_,
  getOrFail_,
  map_,
  toNullable,
} from "@effect-ts-app/core/SyncMaybe"

import { applyFunctions } from "./util.js"

const BasePrototype = XPureBase.prototype as any

const funcs = {
  flatMapMaybe: chain_,
  alt: alt_,
  getOrElse: getOrElse_,
  mapMaybe: map_,
  flatMapMaybeSync: chainSync_,
  getOrFail: getOrFail_,
  toNullable,
}

applyFunctions(funcs, BasePrototype, "SyncMaybe")
