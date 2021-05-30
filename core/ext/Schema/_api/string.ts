import * as CNK from "@effect-ts/core/Collections/Immutable/Chunk"

import { pipe } from "../../Function"
import * as S from "../_schema"
import { constrained } from "./length"

// TODO: Word, for lorem ipsum generation, but as composition?

export const constrainedStringIdentifier =
  S.makeAnnotation<{ minLength: number; maxLength: number }>()
export function makeConstrainedFromString<Brand>(minLength: number, maxLength: number) {
  return pipe(
    S.fromString,
    S.arbitrary((FC) => FC.string({ minLength, maxLength })),
    constrained<Brand>(minLength, maxLength),
    S.mapParserError((_) => CNK.unsafeHead(_.errors).error),
    S.mapConstructorError((_) => CNK.unsafeHead(_.errors).error),
    S.brand<Brand>()
  )
}

export interface ReasonableStringBrand {
  readonly ReasonableString: unique symbol
}

// TODO: Evaluate if it makes sense to inherit the others too.
export type ReasonableString = TextString & LongString & ReasonableStringBrand

export const reasonableStringFromString = pipe(
  makeConstrainedFromString<ReasonableString>(1, 256 - 1),
  S.arbitrary((FC) =>
    FC.lorem({ mode: "words", maxCount: 2 })
      .filter((x) => x.length < 256 - 1 && x.length > 0)
      .map((x) => x as ReasonableString)
  )
)

export const reasonableString = pipe(S.string[">>>"](reasonableStringFromString))

export interface LongStringBrand {
  readonly LongString: unique symbol
}

// TODO: Evaluate if it makes sense to inherit the others too.
export type LongString = TextString & LongStringBrand

export const longStringFromString = pipe(
  makeConstrainedFromString<LongString>(1, 2048 - 1),
  S.arbitrary((FC) =>
    FC.lorem({ mode: "words", maxCount: 25 })
      .filter((x) => x.length < 2048 - 1 && x.length > 0)
      .map((x) => x as LongString)
  )
)

export const longString = pipe(S.string[">>>"](longStringFromString))

export interface TextStringBrand {
  readonly TextString: unique symbol
}

export type TextString = S.NonEmptyString & TextStringBrand

// TODO: compose arbitraries?
export const textStringFromString = pipe(
  makeConstrainedFromString<TextString>(1, 64 * 1024),
  S.arbitrary((FC) =>
    FC.lorem({ mode: "sentences", maxCount: 25 })
      .filter((x) => x.length < 64 * 1024 && x.length > 0)
      .map((x) => x as TextString)
  )
)

export const textString = pipe(S.string[">>>"](textStringFromString))
