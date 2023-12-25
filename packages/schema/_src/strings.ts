import { TitleAnnotationId } from "@effect/schema/AST"
import * as S from "@effect/schema/Schema"
import type * as B from "effect/Brand"
import type { Simplify } from "effect/Types"
import { fromBrand, nominal } from "./ext.js"

const nonEmptyString = S.string.pipe(S.nonEmpty())

export type NonEmptyStringBrand = B.Brand<"NonEmptyString">
export type NonEmptyString = string & NonEmptyStringBrand
export const NonEmptyString = nonEmptyString.pipe(
  S.annotations({ [TitleAnnotationId]: "NonEmptyString" }),
  fromBrand(nominal<NonEmptyString>())
)

export interface NonEmptyString64kBrand extends Simplify<B.Brand<"NonEmptyString64k"> & NonEmptyStringBrand> {}
export type NonEmptyString64k = string & NonEmptyString64kBrand
export const NonEmptyString64k = nonEmptyString.pipe(
  S.maxLength(64 * 1024, { title: "NonEmptyString64k" }),
  fromBrand(nominal<NonEmptyString64k>())
)

export interface NonEmptyString2kBrand extends Simplify<B.Brand<"NonEmptyString2k"> & NonEmptyString64kBrand> {}
export type NonEmptyString2k = string & NonEmptyString2kBrand
export const NonEmptyString2k = nonEmptyString.pipe(
  S.maxLength(2 * 1024, { title: "NonEmptyString2k" }),
  fromBrand(nominal<NonEmptyString2k>())
)

export interface NonEmptyString255Brand extends Simplify<B.Brand<"NonEmptyString255"> & NonEmptyString2kBrand> {}
export type NonEmptyString255 = string & NonEmptyString255Brand
export const NonEmptyString255 = nonEmptyString.pipe(
  S.maxLength(255, { title: "NonEmptyString255" }),
  fromBrand(nominal<NonEmptyString255>())
)
