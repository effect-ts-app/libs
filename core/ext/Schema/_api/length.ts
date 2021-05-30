import { NonEmptyBrand } from "@effect-ts/schema"

import { pipe } from "../../Function"
import * as S from "../_schema"

export const maxLengthIdentifier =
  S.makeAnnotation<{ self: S.SchemaAny; maxLength: number }>()

// TODO: proper errors.

export function maxLength<Brand>(maxLength: number) {
  return <
    ParserInput,
    ParserError extends S.AnyError,
    ParsedShape extends { length: number },
    ConstructorInput,
    ConstructorError extends S.AnyError,
    Encoded,
    Api
  >(
    self: S.Schema<
      ParserInput,
      ParserError,
      ParsedShape,
      ConstructorInput,
      ConstructorError,
      Encoded,
      Api
    >
  ): S.Schema<
    ParserInput,
    S.CompositionE<
      S.NextE<S.RefinementE<S.LeafE<S.NonEmptyE<ParsedShape>>>> | S.PrevE<ParserError>
    >,
    ParsedShape & Brand,
    ConstructorInput,
    S.CompositionE<
      | S.NextE<S.RefinementE<S.LeafE<S.NonEmptyE<ParsedShape>>>>
      | S.PrevE<ConstructorError>
    >,
    Encoded,
    Api
  > =>
    pipe(
      self,
      S.refine(
        (n): n is ParsedShape & Brand => n.length <= maxLength,
        (n) => S.leafE(S.nonEmptyE(n))
      ),
      S.annotate(maxLengthIdentifier, { self, maxLength })
    )
}

export const minLengthIdentifier =
  S.makeAnnotation<{ self: S.SchemaAny; minLength: number }>()

export function minLength<Brand>(minLength: number) {
  if (minLength < 1) {
    throw new Error("Must be at least 1")
  }
  return <
    ParserInput,
    ParserError extends S.AnyError,
    ParsedShape extends { length: number },
    ConstructorInput,
    ConstructorError extends S.AnyError,
    Encoded,
    Api
  >(
    self: S.Schema<
      ParserInput,
      ParserError,
      ParsedShape,
      ConstructorInput,
      ConstructorError,
      Encoded,
      Api
    >
  ): S.Schema<
    ParserInput,
    S.CompositionE<
      S.NextE<S.RefinementE<S.LeafE<S.NonEmptyE<ParsedShape>>>> | S.PrevE<ParserError>
    >,
    ParsedShape & Brand & NonEmptyBrand,
    ConstructorInput,
    S.CompositionE<
      | S.NextE<S.RefinementE<S.LeafE<S.NonEmptyE<ParsedShape>>>>
      | S.PrevE<ConstructorError>
    >,
    Encoded,
    Api
  > =>
    pipe(
      self,
      S.refine(
        (n): n is ParsedShape & Brand & NonEmptyBrand => n.length >= minLength,
        (n) => S.leafE(S.nonEmptyE(n))
      ),
      S.annotate(minLengthIdentifier, { self, minLength })
    )
}

export function constrained<Brand>(min: number, max: number) {
  return <
    ParserInput,
    ParserError extends S.AnyError,
    ParsedShape extends { length: number },
    ConstructorInput,
    ConstructorError extends S.AnyError,
    Encoded,
    Api
  >(
    self: S.Schema<
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
