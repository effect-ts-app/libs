/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import type { PositiveBrand, Schema } from "@effect-app/schema"
import {
  Arbitrary,
  arbitrary,
  array as arrayOriginal,
  brand,
  nonEmptyArray as nonEmptyArrayOriginal,
  number,
  positive,
  set as setOriginal
} from "@effect-app/schema"

import { ROSet } from "@effect-app/core/Prelude"
import type * as EQ from "@effect-ts/core/Equal"

export const PositiveNumber = positive(number)["|>"](brand<PositiveNumber>())
export type PositiveNumber = number & PositiveBrand

export interface CentimeterBrand extends PositiveBrand {
  readonly CentimeterBrand: unique symbol
}

export type Centimeter = number & CentimeterBrand

export const Centimeter = positive(number)["|>"](brand<Centimeter>())

export interface KilogramBrand extends PositiveBrand {
  readonly KilogramBrand: unique symbol
}

export type Kilogram = number & KilogramBrand

export const Kilogram = positive(number)["|>"](brand<Kilogram>())

// Limit arbitrary collections to generate a max of 6 entries
// TODO: dictionary, map
const MAX_LENGTH = 6

export function nonEmptyArray<ParsedShape, ConstructorInput, Encoded, Api>(
  self: Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>
) {
  const arbitrarySelf = Arbitrary.for(self)

  return nonEmptyArrayOriginal(self)["|>"](
    arbitrary(
      _ =>
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
      _ =>
        _.array(arbitrarySelf(_), {
          maxLength: MAX_LENGTH
        }) as any as Arbitrary.Arbitrary<Array<ParsedShape>>
    )
  )
}

export function set<ParsedShape, ConstructorInput, Encoded, Api>(
  self: Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>,
  ord: Ord<ParsedShape>,
  eq: Equivalence<ParsedShape>
) {
  const arbitrarySelf = Arbitrary.for(self)
  const eqO = <EQ.Equal<ParsedShape>> { equals: (x, y) => eq(y)(x) }
  return setOriginal(self, ord, eq)["|>"](
    arbitrary(_ => _.uniqueArray(arbitrarySelf(_), { maxLength: MAX_LENGTH }).map(ROSet.fromArray(eqO)))
  )
}
