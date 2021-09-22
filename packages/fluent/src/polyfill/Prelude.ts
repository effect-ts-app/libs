import { Case, Tagged } from "@effect-ts/core/Case"
import * as XChunk from "@effect-ts/core/Collections/Immutable/Chunk"
import * as XEffect from "@effect-ts/core/Effect"
import {
  die,
  dieWith,
  effectAsync,
  effectAsyncInterrupt,
  fail,
  failWith,
  halt,
  haltWith,
  succeed,
  succeedWith,
} from "@effect-ts/core/Effect"
import * as XManaged from "@effect-ts/core/Effect/Managed"
import * as Equal from "@effect-ts/core/Equal"
import { tag } from "@effect-ts/core/Has"
import * as Ord from "@effect-ts/core/Ord"
import * as Lens from "@effect-ts/monocle/Lens"
import * as XEffectOption from "@effect-ts-app/core/EffectOption"

const gl = global as any

const EffectExtensions = {
  ...XEffect,
  async: effectAsync,
  asyncInterrupt: effectAsyncInterrupt,
  do_: XEffect.do,
  succeedNow: succeed,
  succeed: succeedWith,
  failNow: fail,
  fail: failWith,
  dieNow: die,
  die: dieWith,
  haltNow: halt,
  halt: haltWith,
}

gl.$T = {
  Effect: {
    ...EffectExtensions,
  },
  EffectOption: XEffectOption,
  Equal,
  Ord,
  Lens,
  Managed: XManaged,
  Chunk: XChunk,
  Data: {
    Case,
    Tagged,
    tag,
  },
}
