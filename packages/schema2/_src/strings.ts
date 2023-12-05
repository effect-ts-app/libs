import * as S from "@effect/schema/Schema"

import type * as B from "effect/Brand"
import { fromBrand, nominal } from "./ext"

type Id<A> = A

const nonEmptyString = S.string.pipe(
  S.nonEmpty()
)

export type NonEmptyStringBrand = Id<B.Brand<"NonEmptyString">>
export type NonEmptyString = string & NonEmptyStringBrand
export const NonEmptyString = nonEmptyString.pipe(fromBrand(nominal<NonEmptyString>()))

export interface NonEmptyString2kBrand {
  readonly [B.BrandTypeId]: {
    readonly NonEmptyString2k: "NonEmptyString2k"
  } & {
    readonly NonEmptyString: "NonEmptyString"
  }
}

export type NonEmptyString2k = string & NonEmptyString2kBrand
export const NonEmptyString2k = nonEmptyString.pipe(
  S.maxLength(2048),
  fromBrand(nominal<NonEmptyString2k>())
)

export interface NonEmptyString255Brand //  extends Id<B.Brand<"NonEmptyString255"> & NonEmptyString2kBrand>
{
  readonly [B.BrandTypeId]: {
    readonly NonEmptyString255: "NonEmptyString255"
  } & {
    readonly NonEmptyString2k: "NonEmptyString2k"
  } & {
    readonly NonEmptyString: "NonEmptyString"
  }
}

export type NonEmptyString255 = string & NonEmptyString255Brand

export const NonEmptyString255 = nonEmptyString.pipe(
  S.maxLength(2048),
  fromBrand(nominal<NonEmptyString255>())
)
