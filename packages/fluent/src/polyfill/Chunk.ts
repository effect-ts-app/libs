import * as CNK from "@effect-ts/core/Collections/Immutable/Chunk"
import {
  collectAll,
  forEach_,
  forEachPar_,
  forEachParN_,
} from "@effect-ts-app/core/Effect"

import { applyFunctions, makeAutoFuncs } from "./util"

const exceptions = {}

const funcs = {
  ...makeAutoFuncs(CNK, exceptions),
  // IterableOps
  collectAll,
  forEachParN: forEachParN_,
  forEachPar: forEachPar_,
  forEachEff: forEach_,
}

const BasePrototype = CNK.ChunkInternal.prototype as any

applyFunctions(funcs, BasePrototype, "Chunk")
