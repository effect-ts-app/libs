import { pipe } from "@effect-app/core/Function"

import * as S from "../vendor.js"
import type { NonEmptyBrand } from "../vendor.js"
import { extendWithUtils } from "./_shared.js"
import { constrained } from "./length.js"

// TODO: Word, for lorem ipsum generation, but as composition?

export const constrainedStringIdentifier = S.makeAnnotation<{ minLength: number; maxLength: number }>()
export function makeConstrainedFromString<Brand>(minLength: number, maxLength: number) {
  return pipe(
    S.fromString,
    S.arbitrary((FC) => FC.string({ minLength, maxLength })),
    constrained<Brand>(minLength, maxLength),
    S.mapParserError((_) => (((_ as any).errors) as Chunk<any>).unsafeHead.error),
    S.mapConstructorError((_) => (((_ as any).errors) as Chunk<any>).unsafeHead.error),
    // NOTE: brand must come after, to reap benefits of showing Opaque types in editor
    // if combining types further down the line, must re-apply brand.
    S.brand<Brand>()
  )
}

export type UUID = S.UUID
export const UUID = extendWithUtils(S.UUID)

export const Int = extendWithUtils(S.int)
export type Int = S.Int
export const PositiveInt = extendWithUtils(S.positiveInt)
export type PositiveInt = S.PositiveInt

export const NonEmptyString = extendWithUtils(S.nonEmptyString)
export type NonEmptyString = S.NonEmptyString

/**
 * A string that is at least 1 character long and a maximum of 50.
 */
export interface NonEmptyString50Brand extends NonEmptyString255Brand {
  readonly NonEmptyString50: unique symbol
}

/**
 * A string that is at least 1 character long and a maximum of 50.
 */
export type NonEmptyString50 = string & NonEmptyString50Brand

/**
 * A string that is at least 1 character long and a maximum of 50.
 */
export const nonEmptyString50FromString = pipe(
  makeConstrainedFromString<NonEmptyString50>(1, 256 - 1),
  S.arbitrary((FC) =>
    FC
      .lorem({ mode: "words", maxCount: 2 })
      .filter((x) => x.length < 256 - 1 && x.length > 0)
      .map((x) => x as NonEmptyString50)
  ),
  // arbitrary removes brand benefit
  S.brand<NonEmptyString50>()
)

/**
 * A string that is at least 1 character long and a maximum of 50.
 */
export const NonEmptyString50 = extendWithUtils(
  pipe(S.string[">>>"](nonEmptyString50FromString), S.brand<NonEmptyString50>())
)

/**
 * A string that is at least 1 character long and a maximum of 255.
 */
export interface NonEmptyString255Brand extends NonEmptyString2kBrand {
  readonly NonEmptyString255: unique symbol
}

/**
 * A string that is at least 1 character long and a maximum of 255.
 */
export type NonEmptyString255 = string & NonEmptyString255Brand

/**
 * A string that is at least 1 character long and a maximum of 255.
 */
export const nonEmptyString255FromString = pipe(
  makeConstrainedFromString<NonEmptyString255>(1, 256 - 1),
  S.arbitrary((FC) =>
    FC
      .lorem({ mode: "words", maxCount: 2 })
      .filter((x) => x.length < 256 - 1 && x.length > 0)
      .map((x) => x as NonEmptyString255)
  ),
  // arbitrary removes brand benefit
  S.brand<NonEmptyString255>()
)

/**
 * A string that is at least 1 character long and a maximum of 255.
 */
export const NonEmptyString255 = extendWithUtils(
  pipe(S.string[">>>"](nonEmptyString255FromString), S.brand<NonEmptyString255>())
)

/**
 * A string that is at least 1 character long and a maximum of 2047.
 */
export interface NonEmptyString2kBrand extends NonEmptyString64kBrand {
  readonly NonEmptyString2k: unique symbol
}

/**
 * A string that is at least 1 character long and a maximum of 2047.
 */
export type NonEmptyString2k = string & NonEmptyString2kBrand

/**
 * A string that is at least 1 character long and a maximum of 2047.
 */
export const nonEmptyString2kFromString = pipe(
  makeConstrainedFromString<NonEmptyString2k>(1, 2048 - 1),
  S.arbitrary((FC) =>
    FC
      .lorem({ mode: "words", maxCount: 25 })
      .filter((x) => x.length < 2048 - 1 && x.length > 0)
      .map((x) => x as NonEmptyString2k)
  ),
  // arbitrary removes brand benefit
  S.brand<NonEmptyString2k>()
)

/**
 * A string that is at least 1 character long and a maximum of 2047.
 */
export const NonEmptyString2k = extendWithUtils(
  pipe(S.string[">>>"](nonEmptyString2kFromString), S.brand<NonEmptyString2k>())
)

/**
 * A string that is at least 1 character long and a maximum of 64kb.
 */
export interface NonEmptyString64kBrand extends NonEmptyBrand {
  readonly NonEmptyString64k: unique symbol
}

/**
 * A string that is at least 1 character long and a maximum of 64kb.
 */
export type NonEmptyString64k = string & NonEmptyString64kBrand

// TODO: compose arbitraries?
/**
 * A string that is at least 1 character long and a maximum of 64kb.
 */
export const nonEmptyString64kFromString = pipe(
  makeConstrainedFromString<NonEmptyString64k>(1, 64 * 1024),
  S.arbitrary((FC) =>
    FC
      .lorem({ mode: "sentences", maxCount: 25 })
      .filter((x) => x.length < 64 * 1024 && x.length > 0)
      .map((x) => x as NonEmptyString64k)
  ),
  // arbitrary removes brand benefit
  S.brand<NonEmptyString64k>()
)

/**
 * A string that is at least 1 character long and a maximum of 64kb.
 */
export const NonEmptyString64k = extendWithUtils(
  pipe(S.string[">>>"](nonEmptyString64kFromString), S.brand<NonEmptyString64k>())
)
