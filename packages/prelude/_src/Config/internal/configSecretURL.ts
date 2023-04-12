import * as Chunk from "@effect/data/Chunk"
import * as EQ from "@effect/data/Equal"
import { pipe } from "@effect/data/Function"
import * as Hash from "@effect/data/Hash"
import { ConfigSecretTypeId } from "@effect/io/Config/Secret"
import type * as ConfigSecretURL from "../SecretURL.js"

/** @internal */
const ConfigSecretURLSymbolKey = "@effect/io/Config/Secret" // "@effect-app/prelude/COnfigSecretURL"

/** @internal */
export const proto = {
  [ConfigSecretTypeId]: ConfigSecretTypeId,
  [Hash.symbol](this: ConfigSecretURL.ConfigSecretURL): number {
    return pipe(
      Hash.hash(ConfigSecretURLSymbolKey),
      Hash.combine(Hash.hash(this.raw))
    )
  },
  [EQ.symbol](this: ConfigSecretURL.ConfigSecretURL, that: unknown): boolean {
    return isConfigSecretURL(that) && Equal.equals(this.raw, that.raw)
  }
}

/** @internal */
export const isConfigSecretURL = (u: unknown): u is ConfigSecretURL.ConfigSecretURL => {
  return typeof u === "object" && u != null && ConfigSecretTypeId in u
}

/** @internal */
export const make = (bytes: Array<number>): ConfigSecretURL.ConfigSecretURL => {
  const secret = Object.create(proto)
  let protocol = "unknown"
  try {
    const url = new URL(bytes.map((byte) => String.fromCharCode(byte)).join(""))
    protocol = url.protocol.substring(0, url.protocol.length - 1)
  } catch {
    const matches = protocol.match(/^([^:]+):\/\//)
    if (matches !== null) {
      protocol = matches[1]!
    }
  }
  Object.defineProperty(secret, "toJSON", {
    enumerable: false,
    value() {
      return ({
        _tag: "ConfigSecretURL",
        protocol
      })
    }
  })
  Object.defineProperty(secret, "toString", {
    enumerable: false,
    value() {
      return `ConfigSecretURL(${protocol}://<redacted>)`
    }
  })
  Object.defineProperty(secret, "raw", {
    enumerable: false,
    value: bytes
  })
  return secret
}

/** @internal */
export const fromChunk = (chunk: Chunk.Chunk<string>): ConfigSecretURL.ConfigSecretURL => {
  return make(Chunk.toReadonlyArray(chunk).map((char) => char.charCodeAt(0)))
}

/** @internal */
export const fromString = (text: string): ConfigSecretURL.ConfigSecretURL => {
  return make(text.split("").map((char) => char.charCodeAt(0)))
}

/** @internal */
export const value = (self: ConfigSecretURL.ConfigSecretURL): string => {
  return self.raw.map((byte) => String.fromCharCode(byte)).join("")
}

/** @internal */
export const unsafeWipe = (self: ConfigSecretURL.ConfigSecretURL): void => {
  for (let i = 0; i < self.raw.length; i++) {
    self.raw[i] = 0
  }
}
