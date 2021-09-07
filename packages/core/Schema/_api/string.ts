import * as CNK from "@effect-ts/core/Collections/Immutable/Chunk"

import { pipe } from "../../Function"
import * as MO from "../_schema"
import { NonEmptyBrand, ParsedShapeOf } from "../_schema"
import { constrained } from "./length"

// TODO: Word, for lorem ipsum generation, but as composition?

export const constrainedStringIdentifier =
  MO.makeAnnotation<{ minLength: number; maxLength: number }>()
export function makeConstrainedFromString<Brand>(minLength: number, maxLength: number) {
  return pipe(
    MO.fromString,
    MO.arbitrary((FC) => FC.string({ minLength, maxLength })),
    constrained<Brand>(minLength, maxLength),
    MO.mapParserError((_) => (CNK.unsafeHead((_ as any).errors) as any).error),
    MO.mapConstructorError((_) => (CNK.unsafeHead((_ as any).errors) as any).error),
    MO.brand<Brand>()
  )
}

/**
 * A string that is at least 1 character long and a maximum of 255.
 */
export interface ReasonableStringBrand extends LongStringBrand {
  readonly ReasonableString: unique symbol
}

/**
 * A string that is at least 1 character long and a maximum of 255.
 */
export type ReasonableString = ParsedShapeOf<typeof reasonableString>

type ReasonableString_ = string & ReasonableStringBrand

/**
 * A string that is at least 1 character long and a maximum of 255.
 */
export const reasonableStringFromString = pipe(
  makeConstrainedFromString<ReasonableString_>(1, 256 - 1),
  MO.arbitrary((FC) =>
    FC.lorem({ mode: "words", maxCount: 2 })
      .filter((x) => x.length < 256 - 1 && x.length > 0)
      .map((x) => x as ReasonableString_)
  )
)

/**
 * A string that is at least 1 character long and a maximum of 255.
 */
export const reasonableString = pipe(MO.string[">>>"](reasonableStringFromString))

/**
 * A string that is at least 1 character long and a maximum of 2048.
 */
export interface LongStringBrand extends TextStringBrand {
  readonly LongString: unique symbol
}

/**
 * A string that is at least 1 character long and a maximum of 2048.
 */
export type LongString = ParsedShapeOf<typeof longString>

type LongString_ = string & LongStringBrand

/**
 * A string that is at least 1 character long and a maximum of 2048.
 */
export const longStringFromString = pipe(
  makeConstrainedFromString<LongString_>(1, 2048 - 1),
  MO.arbitrary((FC) =>
    FC.lorem({ mode: "words", maxCount: 25 })
      .filter((x) => x.length < 2048 - 1 && x.length > 0)
      .map((x) => x as LongString_)
  )
)

/**
 * A string that is at least 1 character long and a maximum of 2048.
 */
export const longString = pipe(MO.string[">>>"](longStringFromString))

/**
 * A string that is at least 1 character long and a maximum of 64kb.
 */
export interface TextStringBrand extends NonEmptyBrand {
  readonly TextString: unique symbol
}

/**
 * A string that is at least 1 character long and a maximum of 64kb.
 */
export type TextString = ParsedShapeOf<typeof textString>

type TextString_ = string & TextStringBrand

// TODO: compose arbitraries?
/**
 * A string that is at least 1 character long and a maximum of 64kb.
 */
export const textStringFromString = pipe(
  makeConstrainedFromString<TextString_>(1, 64 * 1024),
  MO.arbitrary((FC) =>
    FC.lorem({ mode: "sentences", maxCount: 25 })
      .filter((x) => x.length < 64 * 1024 && x.length > 0)
      .map((x) => x as TextString_)
  )
)

/**
 * A string that is at least 1 character long and a maximum of 64kb.
 */
export const textString = pipe(MO.string[">>>"](textStringFromString))
