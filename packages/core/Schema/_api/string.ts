import * as CNK from "@effect-ts/core/Collections/Immutable/Chunk"

import { pipe } from "../../Function"
import * as MO from "../_schema"
import { NonEmptyBrand } from "../_schema"
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
export type ReasonableString = string & ReasonableStringBrand

/**
 * A string that is at least 1 character long and a maximum of 255.
 */
export const reasonableStringFromString = pipe(
  makeConstrainedFromString<ReasonableString>(1, 256 - 1),
  MO.arbitrary((FC) =>
    FC.lorem({ mode: "words", maxCount: 2 })
      .filter((x) => x.length < 256 - 1 && x.length > 0)
      .map((x) => x as ReasonableString)
  )
)

/**
 * A string that is at least 1 character long and a maximum of 255.
 */
export const ReasonableString = pipe(MO.string[">>>"](reasonableStringFromString))

/**
 * A string that is at least 1 character long and a maximum of 255.
 * @deprecated @see ReasonableString
 */
export const reasonableString = ReasonableString

/**
 * A string that is at least 1 character long and a maximum of 2048.
 */
export interface LongStringBrand extends TextStringBrand {
  readonly LongString: unique symbol
}

/**
 * A string that is at least 1 character long and a maximum of 2048.
 */
export type LongString = string & LongStringBrand

/**
 * A string that is at least 1 character long and a maximum of 2048.
 */
export const longStringFromString = pipe(
  makeConstrainedFromString<LongString>(1, 2048 - 1),
  MO.arbitrary((FC) =>
    FC.lorem({ mode: "words", maxCount: 25 })
      .filter((x) => x.length < 2048 - 1 && x.length > 0)
      .map((x) => x as LongString)
  )
)

/**
 * A string that is at least 1 character long and a maximum of 2048.
 */
export const LongString = pipe(MO.string[">>>"](longStringFromString))

/**
 * A string that is at least 1 character long and a maximum of 2048.
 */
export const longString = LongString

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
  MO.arbitrary((FC) =>
    FC.lorem({ mode: "sentences", maxCount: 25 })
      .filter((x) => x.length < 64 * 1024 && x.length > 0)
      .map((x) => x as TextString)
  )
)

/**
 * A string that is at least 1 character long and a maximum of 64kb.
 */
export const TextString = pipe(MO.string[">>>"](textStringFromString))
/**
 * A string that is at least 1 character long and a maximum of 255.
 * @deprecated @see TextString
 */
export const textString = TextString
