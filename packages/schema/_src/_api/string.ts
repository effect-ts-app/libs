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
 * A string that is at least 1 character long and a maximum of 255.
 */
export interface ReasonableStringBrand extends LongStringBrand {
  readonly ReasonableString: unique symbol
}

/**
 * A string that is at least 1 character long and a maximum of 255.
 */
export type ReasonableString = string & ReasonableStringBrand

/**
 * A string that is at least 1 character long and a maximum of 255.
 */
export const reasonableStringFromString = pipe(
  makeConstrainedFromString<ReasonableString>(1, 256 - 1),
  S.arbitrary((FC) =>
    FC
      .lorem({ mode: "words", maxCount: 2 })
      .filter((x) => x.length < 256 - 1 && x.length > 0)
      .map((x) => x as ReasonableString)
  ),
  // arbitrary removes brand benefit
  S.brand<ReasonableString>()
)

/**
 * A string that is at least 1 character long and a maximum of 255.
 */
export const ReasonableString = extendWithUtils(
  pipe(S.string[">>>"](reasonableStringFromString), S.brand<ReasonableString>())
)

/**
 * A string that is at least 1 character long and a maximum of 2047.
 */
export interface LongStringBrand extends TextStringBrand {
  readonly LongString: unique symbol
}

/**
 * A string that is at least 1 character long and a maximum of 2047.
 */
export type LongString = string & LongStringBrand

/**
 * A string that is at least 1 character long and a maximum of 2047.
 */
export const longStringFromString = pipe(
  makeConstrainedFromString<LongString>(1, 2048 - 1),
  S.arbitrary((FC) =>
    FC
      .lorem({ mode: "words", maxCount: 25 })
      .filter((x) => x.length < 2048 - 1 && x.length > 0)
      .map((x) => x as LongString)
  ),
  // arbitrary removes brand benefit
  S.brand<LongString>()
)

/**
 * A string that is at least 1 character long and a maximum of 2047.
 */
export const LongString = extendWithUtils(
  pipe(S.string[">>>"](longStringFromString), S.brand<LongString>())
)

/**
 * A string that is at least 1 character long and a maximum of 64kb.
 */
export interface TextStringBrand extends NonEmptyBrand {
  readonly TextString: unique symbol
}

/**
 * A string that is at least 1 character long and a maximum of 64kb.
 */
export type TextString = string & TextStringBrand

// TODO: compose arbitraries?
/**
 * A string that is at least 1 character long and a maximum of 64kb.
 */
export const textStringFromString = pipe(
  makeConstrainedFromString<TextString>(1, 64 * 1024),
  S.arbitrary((FC) =>
    FC
      .lorem({ mode: "sentences", maxCount: 25 })
      .filter((x) => x.length < 64 * 1024 && x.length > 0)
      .map((x) => x as TextString)
  ),
  // arbitrary removes brand benefit
  S.brand<TextString>()
)

/**
 * A string that is at least 1 character long and a maximum of 64kb.
 */
export const TextString = extendWithUtils(
  pipe(S.string[">>>"](textStringFromString), S.brand<TextString>())
)
