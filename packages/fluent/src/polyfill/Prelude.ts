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
import { tag } from "@effect-ts/core/Has"

const gl = global as any

gl.T.Effect = {
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
gl.T.Managed = XManaged
gl.T.Chunk = XChunk
gl.T.Data = {
  Case,
  Tagged,
  tag,
}
