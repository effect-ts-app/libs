import { NonEmptyBrand } from "../custom"

import { pipe } from "../../Function"
import * as MO from "../_schema"

export const maxLengthIdentifier =
  MO.makeAnnotation<{ self: MO.SchemaAny; maxLength: number }>()

// TODO: proper errors.

export function maxLength<Brand>(maxLength: number) {
  return <
    ParserInput,
    ParsedShape extends { length: number },
    ConstructorInput,
    Encoded,
    Api
  >(
    self: MO.Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
  ): MO.Schema<ParserInput, ParsedShape & Brand, ConstructorInput, Encoded, Api> =>
    pipe(
      self,
      MO.refine(
        (n): n is ParsedShape & Brand => n.length <= maxLength,
        (n) => MO.leafE(MO.nonEmptyE(n))
      ),
      MO.annotate(maxLengthIdentifier, { self, maxLength })
    )
}

export const minLengthIdentifier =
  MO.makeAnnotation<{ self: MO.SchemaAny; minLength: number }>()

export function minLength<Brand>(minLength: number) {
  if (minLength < 1) {
    throw new Error("Must be at least 1")
  }
  return <
    ParserInput,
    ParsedShape extends { length: number },
    ConstructorInput,
    Encoded,
    Api
  >(
    self: MO.Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
  ): MO.Schema<
    ParserInput,
    ParsedShape & Brand & NonEmptyBrand,
    ConstructorInput,
    Encoded,
    Api
  > =>
    pipe(
      self,
      MO.refine(
        (n): n is ParsedShape & Brand & NonEmptyBrand => n.length >= minLength,
        (n) => MO.leafE(MO.nonEmptyE(n))
      ),
      MO.annotate(minLengthIdentifier, { self, minLength })
    )
}

export function constrained<Brand>(min: number, max: number) {
  return <
    ParserInput,
    ParsedShape extends { length: number },
    ConstructorInput,
    Encoded,
    Api
  >(
    self: MO.Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
  ) => pipe(self, minLength<Brand>(min), maxLength<Brand>(max))
}
