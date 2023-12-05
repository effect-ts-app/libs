import * as S from "@effect/schema/Schema"

import type * as B from "effect/Brand"
import { fromBrand, nominal } from "./ext.js"

const nonEmptyString = S.string.pipe(
  S.nonEmpty()
)

export type NonEmptyStringBrand = B.Brand<"NonEmptyString">
export type NonEmptyString = string & NonEmptyStringBrand
export const NonEmptyString = nonEmptyString.pipe(fromBrand(nominal<NonEmptyString>()))

export interface NonEmptyString64kBrand { //  extends Id<B.Brand<"NonEmptyString64k">>
  readonly [B.BrandTypeId]: {
    readonly NonEmptyString64k: "NonEmptyString64k"
  } & {
    readonly NonEmptyString: "NonEmptyString"
  }
}
export type NonEmptyString64k = string & NonEmptyString64kBrand
export const NonEmptyString64k = nonEmptyString.pipe(
  S.maxLength(2048),
  fromBrand(nominal<NonEmptyString64k>())
)

export interface NonEmptyString2kBrand { //  extends Id<B.Brand<"NonEmptyString2k">>
  readonly [B.BrandTypeId]: {
    readonly NonEmptyString2k: "NonEmptyString2k"
  } & {
    readonly NonEmptyString64k: "NonEmptyString64k"
  } & {
    readonly NonEmptyString: "NonEmptyString"
  }
}
export type NonEmptyString2k = string & NonEmptyString2kBrand
export const NonEmptyString2k = nonEmptyString.pipe(
  S.maxLength(2048),
  fromBrand(nominal<NonEmptyString2k>())
)

export interface NonEmptyString255Brand //  extends Id<B.Brand<"NonEmptyString255"> & NonEmptyString64kBrand>
{
  readonly [B.BrandTypeId]: {
    readonly NonEmptyString255: "NonEmptyString255"
  } & {
    readonly NonEmptyString2k: "NonEmptyString2k"
  } & {
    readonly NonEmptyString64k: "NonEmptyString64k"
  } & {
    readonly NonEmptyString: "NonEmptyString"
  }
}
export type NonEmptyString255 = string & NonEmptyString255Brand
export const NonEmptyString255 = nonEmptyString.pipe(
  S.maxLength(2048),
  fromBrand(nominal<NonEmptyString255>())
)
