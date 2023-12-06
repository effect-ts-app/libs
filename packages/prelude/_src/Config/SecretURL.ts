/**
 * @since 1.0.0
 */
import type * as Chunk from "effect/Chunk"
import type { SecretTypeId } from "effect/Secret"
import type * as Equal from "effect/Equal"
import * as internal from "./internal/configSecretURL.js"

// /**
//  * @since 1.0.0
//  * @category symbols
//  */
// export const SecretURLTypeId: unique symbol = internal.SecretURLTypeId

// /**
//  * @since 1.0.0
//  * @category symbols
//  */
// export type SecretURLTypeId = typeof SecretURLTypeId

/**
 * @tsplus type SecretURL
 * @since 1.0.0
 * @category models
 */
export interface SecretURL extends SecretURL.Proto, Equal.Equal {
  /** @internal */
  readonly raw: Array<number>
}

/**
 * @tsplus type SecretURL.Ops
 */
export interface SecretURLOps {}

export const SecretURL: SecretURLOps = {}

/**
 * @since 1.0.0
 */
export declare namespace SecretURL {
  /**
   * @since 1.0.0
   * @category models
   */
  export interface Proto {
    readonly [SecretTypeId]: SecretTypeId
  }
}

/**
 * @tsplus static SecretURL.Ops isSecretURL
 * @since 1.0.0
 * @category refinements
 */
export const isSecretURL: (u: unknown) => u is SecretURL = internal.isSecretURL

/**
 * @tsplus static SecretURL.Ops make
 * @since 1.0.0
 * @category constructors
 */
export const make: (bytes: Array<number>) => SecretURL = internal.make

/**
 * @tsplus static SecretURL.Ops fromChunk
 * @since 1.0.0
 * @category constructors
 */
export const fromChunk: (chunk: Chunk.Chunk<string>) => SecretURL = internal.fromChunk

/**
 * @tsplus static SecretURL.Ops fromString
 * @since 1.0.0
 * @category constructors
 */
export const fromString: (text: string) => SecretURL = internal.fromString

/**
 * @tsplus getter SecretURL value
 * @since 1.0.0
 * @category getters
 */
export const value: (self: SecretURL) => string = internal.value

/**
 * @tsplus fluent SecretURL unsafeWipe
 * @since 1.0.0
 * @category unsafe
 */
export const unsafeWipe: (self: SecretURL) => void = internal.unsafeWipe

/**
 * @tsplus static effect/io/Config.Ops secretURL
 */
export const secretURL = (name?: string): Config<SecretURL> => {
  const config = Config.primitive(
    "a secret property",
    (text) => Either(fromString(text))
  )
  return name === undefined ? config : config.nested(name)
}
