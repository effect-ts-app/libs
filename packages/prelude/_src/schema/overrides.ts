/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import type { PositiveBrand, PositiveExcludeZeroBrand, Schema } from "@effect-app/schema"
import {
  Arbitrary,
  arbitrary,
  array as arrayOriginal,
  brand,
  nonEmptyArray as nonEmptyArrayOriginal,
  number,
  positive,
  positiveExcludeZero,
  set as setOriginal
} from "@effect-app/schema"

import { ROSet } from "@effect-app/core/Prelude"

export const PositiveNumber = positive("float")(number)["|>"](brand<PositiveNumber>())
export type PositiveNumber = number & PositiveBrand

export const PositiveNumberZeroExclusive = positiveExcludeZero("float")(number)["|>"](brand<PositiveNumber>())
export type PositiveNumberZeroExclusive = number & PositiveExcludeZeroBrand

export interface CentimeterBrand extends PositiveBrand {
  readonly CentimeterBrand: unique symbol
}

export type Centimeter = number & CentimeterBrand

export const Centimeter = positive("float")(number)["|>"](brand<Centimeter>())

export interface KilogramBrand extends PositiveBrand {
  readonly KilogramBrand: unique symbol
}

export type Kilogram = number & KilogramBrand

export const Kilogram = positive("float")(number)["|>"](brand<Kilogram>())

// Limit arbitrary collections to generate a max of 6 entries
// TODO: dictionary, map
const MAX_LENGTH = 6

export function nonEmptyArray<ParsedShape, ConstructorInput, Encoded, Api>(
  self: Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>
) {
  const arbitrarySelf = Arbitrary.for(self)

  return nonEmptyArrayOriginal(self)["|>"](
    arbitrary(
      (_) =>
        _.array(arbitrarySelf(_), {
          minLength: 1,
          maxLength: MAX_LENGTH
        }) as any as Arbitrary.Arbitrary<NonEmptyReadonlyArray<ParsedShape>>
    )
  )
}

export function array<ParsedShape, ConstructorInput, Encoded, Api>(
  self: Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>
) {
  const arbitrarySelf = Arbitrary.for(self)

  return arrayOriginal(self)["|>"](
    arbitrary(
      (_) =>
        _.array(arbitrarySelf(_), {
          maxLength: MAX_LENGTH
        }) as any as Arbitrary.Arbitrary<Array<ParsedShape>>
    )
  )
}

export function set<ParsedShape, ConstructorInput, Encoded, Api>(
  self: Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>,
  ord: Order<ParsedShape>,
  eq: Equivalence<ParsedShape>
) {
  const arbitrarySelf = Arbitrary.for(self)
  return setOriginal(self, ord, eq)["|>"](
    arbitrary((_) => _.uniqueArray(arbitrarySelf(_), { maxLength: MAX_LENGTH }).map(ROSet.fromArray(eq)))
  )
}
