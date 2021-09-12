import { Case, Tagged } from "@effect-ts/core/Case"
import * as XChunk from "@effect-ts/core/Collections/Immutable/Chunk"
import * as XEffect from "@effect-ts/core/Effect"
import * as XManaged from "@effect-ts/core/Effect/Managed"
import { tag } from "@effect-ts/core/Has"

const gl = global as any

gl.Effect = XEffect
gl.Managed = XManaged
gl.Chunk = XChunk
gl.Data = {
  Case,
  Tagged,
  tag,
}
