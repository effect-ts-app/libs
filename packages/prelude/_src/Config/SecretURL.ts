/**
 * @since 1.0.0
 */
import type * as Chunk from "@effect/data/Chunk"
import type * as Equal from "@effect/data/Equal"
import type { ConfigSecretTypeId } from "@effect/io/Config/Secret"
import * as internal from "./internal/configSecretURL.js"

// /**
//  * @since 1.0.0
//  * @category symbols
//  */
// export const ConfigSecretURLTypeId: unique symbol = internal.ConfigSecretURLTypeId

// /**
//  * @since 1.0.0
//  * @category symbols
//  */
// export type ConfigSecretURLTypeId = typeof ConfigSecretURLTypeId

/**
 * @tsplus type ConfigSecretURL
 * @since 1.0.0
 * @category models
 */
export interface ConfigSecretURL extends ConfigSecretURL.Proto, Equal.Equal {
  /** @internal */
  readonly raw: Array<number>
}

/**
 * @tsplus type ConfigSecretURL.Ops
 */
export interface ConfigSecretURLOps {}

export const ConfigSecretURL: ConfigSecretURLOps = {}

/**
 * @since 1.0.0
 */
export declare namespace ConfigSecretURL {
  /**
   * @since 1.0.0
   * @category models
   */
  export interface Proto {
    readonly [ConfigSecretTypeId]: ConfigSecretTypeId
  }
}

/**
 * @tsplus static ConfigSecretURL.Ops isConfigSecretURL
 * @since 1.0.0
 * @category refinements
 */
export const isConfigSecretURL: (u: unknown) => u is ConfigSecretURL = internal.isConfigSecretURL

/**
 * @tsplus static ConfigSecretURL.Ops make
 * @since 1.0.0
 * @category constructors
 */
export const make: (bytes: Array<number>) => ConfigSecretURL = internal.make

/**
 * @tsplus static ConfigSecretURL.Ops fromChunk
 * @since 1.0.0
 * @category constructors
 */
export const fromChunk: (chunk: Chunk.Chunk<string>) => ConfigSecretURL = internal.fromChunk

/**
 * @tsplus static ConfigSecretURL.Ops fromString
 * @since 1.0.0
 * @category constructors
 */
export const fromString: (text: string) => ConfigSecretURL = internal.fromString

/**
 * @tsplus getter ConfigSecretURL value
 * @since 1.0.0
 * @category getters
 */
export const value: (self: ConfigSecretURL) => string = internal.value

/**
 * @tsplus fluent ConfigSecretURL unsafeWipe
 * @since 1.0.0
 * @category unsafe
 */
export const unsafeWipe: (self: ConfigSecretURL) => void = internal.unsafeWipe

/**
 * @tsplus static effect/io/Config.Ops secretURL
 */
export const secretURL = (name?: string): Config<ConfigSecretURL> => {
  const config = Config.primitive(
    "a secret property",
    text => Either(fromString(text))
  )
  return name === undefined ? config : config.nested(name)
}
