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
    MO.mapParserError((_) => CNK.unsafeHead(_.errors).error),
    MO.mapConstructorError((_) => CNK.unsafeHead(_.errors).error),
    MO.brand<Brand>()
  )
}

export interface ReasonableStringBrand extends LongStringBrand {
  readonly ReasonableString: unique symbol
}

export type ReasonableString = string & ReasonableStringBrand

export const reasonableStringFromString = pipe(
  makeConstrainedFromString<ReasonableString>(1, 256 - 1),
  MO.arbitrary((FC) =>
    FC.lorem({ mode: "words", maxCount: 2 })
      .filter((x) => x.length < 256 - 1 && x.length > 0)
      .map((x) => x as ReasonableString)
  )
)

export const reasonableString = pipe(MO.string[">>>"](reasonableStringFromString))

export interface LongStringBrand extends TextStringBrand {
  readonly LongString: unique symbol
}

export type LongString = string & LongStringBrand

export const longStringFromString = pipe(
  makeConstrainedFromString<LongString>(1, 2048 - 1),
  MO.arbitrary((FC) =>
    FC.lorem({ mode: "words", maxCount: 25 })
      .filter((x) => x.length < 2048 - 1 && x.length > 0)
      .map((x) => x as LongString)
  )
)

export const longString = pipe(MO.string[">>>"](longStringFromString))

export interface TextStringBrand extends NonEmptyBrand {
  readonly TextString: unique symbol
}

export type TextString = string & TextStringBrand

// TODO: compose arbitraries?
export const textStringFromString = pipe(
  makeConstrainedFromString<TextString>(1, 64 * 1024),
  MO.arbitrary((FC) =>
    FC.lorem({ mode: "sentences", maxCount: 25 })
      .filter((x) => x.length < 64 * 1024 && x.length > 0)
      .map((x) => x as TextString)
  )
)

export const textString = pipe(MO.string[">>>"](textStringFromString))
