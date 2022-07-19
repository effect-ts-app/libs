import * as CNK from "@effect-ts-app/core/Chunk"
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

import { applyFunctions, makeAutoFuncs } from "./util.js"

const exceptions: Partial<Record<keyof Omit<typeof CNK, "toString">, string | null>> = {
  chain_: null, // collides with implementation details currently :'(
}

const funcs = {
  ...makeAutoFuncs(CNK, exceptions),
  collect: Chunk.collect_,
  collectWithIndex: Chunk.collectWithIndex_,
  // IterableOps
  collectAll,
  forEachParN: forEachParN_,
  forEachPar: forEachPar_,
  forEachEffect: forEach_,
  collectAllSync,
  forEachSync,
}

const BasePrototype = Chunk.ChunkInternal.prototype as any

applyFunctions(funcs, BasePrototype, "Chunk")
