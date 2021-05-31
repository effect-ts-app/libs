import { NonEmptyBrand } from "@effect-ts/schema"

import { pipe } from "../../Function"
import * as MO from "../_schema"

export const maxLengthIdentifier =
  MO.makeAnnotation<{ self: MO.SchemaAny; maxLength: number }>()

// TODO: proper errors.

export function maxLength<Brand>(maxLength: number) {
  return <
    ParserInput,
    ParserError extends MO.AnyError,
    ParsedShape extends { length: number },
    ConstructorInput,
    ConstructorError extends MO.AnyError,
    Encoded,
    Api
  >(
    self: MO.Schema<
      ParserInput,
      ParserError,
      ParsedShape,
      ConstructorInput,
      ConstructorError,
      Encoded,
      Api
    >
  ): MO.Schema<
    ParserInput,
    MO.CompositionE<
      | MO.NextE<MO.RefinementE<MO.LeafE<MO.NonEmptyE<ParsedShape>>>>
      | MO.PrevE<ParserError>
    >,
    ParsedShape & Brand,
    ConstructorInput,
    MO.CompositionE<
      | MO.NextE<MO.RefinementE<MO.LeafE<MO.NonEmptyE<ParsedShape>>>>
      | MO.PrevE<ConstructorError>
    >,
    Encoded,
    Api
  > =>
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
    ParserError extends MO.AnyError,
    ParsedShape extends { length: number },
    ConstructorInput,
    ConstructorError extends MO.AnyError,
    Encoded,
    Api
  >(
    self: MO.Schema<
      ParserInput,
      ParserError,
      ParsedShape,
      ConstructorInput,
      ConstructorError,
      Encoded,
      Api
    >
  ): MO.Schema<
    ParserInput,
    MO.CompositionE<
      | MO.NextE<MO.RefinementE<MO.LeafE<MO.NonEmptyE<ParsedShape>>>>
      | MO.PrevE<ParserError>
    >,
    ParsedShape & Brand & NonEmptyBrand,
    ConstructorInput,
    MO.CompositionE<
      | MO.NextE<MO.RefinementE<MO.LeafE<MO.NonEmptyE<ParsedShape>>>>
      | MO.PrevE<ConstructorError>
    >,
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
    ParserError extends MO.AnyError,
    ParsedShape extends { length: number },
    ConstructorInput,
    ConstructorError extends MO.AnyError,
    Encoded,
    Api
  >(
    self: MO.Schema<
      ParserInput,
      ParserError,
      ParsedShape,
      ConstructorInput,
      ConstructorError,
      Encoded,
      Api
    >
  ) => pipe(self, minLength<Brand>(min), maxLength<Brand>(max))
}
