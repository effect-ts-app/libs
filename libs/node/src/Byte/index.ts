// ets_tracing: off

import type { Brand } from "@tsplus/runtime/Brand"

/**
 * @tsplus type effect/node/Byte.Ops
 */
export interface ByteOps {}
export const Byte: ByteOps = {}
export type Byte = number & Brand<"Byte">

/**
 * @ets_optimize identity
 * @tsplus static effect/node/Byte.Ops byte
 */
export function byte(n: number): Byte {
  return n as any
}

/**
 * @tsplus static effect/node/Byte.Ops chunk
 */
export function chunk(buf: Buffer): Chunk<Byte> {
  return Chunk.from(buf) as any
}

/**
 * @tsplus static effect/node/Byte.Ops buffer
 */
export function buffer(buf: Chunk<Byte>): Buffer {
  return buf.toArrayLike as any
}
