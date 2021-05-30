/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
// tracing: off

import * as E from "@effect-ts/core/Either"
import { pipe } from "@effect-ts/core/Function"
import * as S from "@effect-ts/schema"
import * as Arbitrary from "@effect-ts/schema/Arbitrary"
import * as Encoder from "@effect-ts/schema/Encoder"
import * as Guard from "@effect-ts/schema/Guard"
import * as Parser from "@effect-ts/schema/Parser"
import * as Th from "@effect-ts/schema/These"

export const fromEitherIdentifier =
  S.makeAnnotation<{ left: S.SchemaAny; right: S.SchemaAny }>()

/**
 *  @experimental
 */
export function fromEither<
  LeftParserInput,
  LeftParserError extends S.AnyError,
  LeftParsedShape,
  LeftConstructorInput,
  LeftConstructorError extends S.AnyError,
  LeftEncoded,
  LeftApi,
  ParserInput,
  ParserError extends S.AnyError,
  ParsedShape,
  ConstructorInput,
  ConstructorError extends S.AnyError,
  Encoded,
  Api
>(
  left: S.Schema<
    LeftParserInput,
    LeftParserError,
    LeftParsedShape,
    LeftConstructorInput,
    LeftConstructorError,
    LeftEncoded,
    LeftApi
  >,
  right: S.Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >
): S.DefaultSchema<
  object,
  LeftParserError | ParserError, // TODO
  E.Either<LeftParsedShape, ParsedShape>,
  object,
  LeftParserError | ParserError, // TODO
  E.Either<LeftEncoded, Encoded>,
  { left: LeftApi; right: Api }
> {
  const leftGuard = Guard.for(left)
  const leftArb = Arbitrary.for(left)
  const leftParse = Parser.for(left)
  const leftEncode = Encoder.for(left)

  const guard = Guard.for(right)
  const arb = Arbitrary.for(right)
  const parse = Parser.for(right)
  const encode = Encoder.for(right)

  const refinement = (_: unknown): _ is E.Either<LeftParsedShape, ParsedShape> => {
    const ei = _ as E.Either<any, any>
    return (
      typeof _ === "object" &&
      _ != null &&
      ((E.isLeft(ei) && leftGuard(ei.left)) || (E.isRight(ei) && guard(ei.right)))
    )
  }

  const parseEither = (i: object) => {
    const ei = i as E.Either<any, any>
    if (E.isLeft(ei)) {
      return leftParse(ei.left)
    }
    if (E.isRight(ei)) {
      return parse(ei.right)
    }
    return Th.fail(S.parseObjectE("not an either"))
  }

  return pipe(
    S.identity(refinement),
    S.arbitrary((_) => _.oneof(leftArb(_).map(E.left), arb(_).map(E.right)) as any),
    S.parser(parseEither as any),
    S.constructor(parseEither as any),
    S.encoder((_) => E.bimap_(_, leftEncode, encode)),
    S.mapApi(() => ({ left: left.Api, right: right.Api })),
    S.withDefaults,
    S.annotate(fromEitherIdentifier, { left, right })
  ) as any
}

export const eitherIdentifier =
  S.makeAnnotation<{ left: S.SchemaAny; right: S.SchemaAny }>()

/**
 *  @experimental
 */
export function either<
  LeftParserError extends S.AnyError,
  LeftParsedShape,
  LeftConstructorInput,
  LeftConstructorError extends S.AnyError,
  LeftEncoded,
  LeftApi,
  ParserError extends S.AnyError,
  ParsedShape,
  ConstructorInput,
  ConstructorError extends S.AnyError,
  Encoded,
  Api
>(
  left: S.Schema<
    unknown,
    LeftParserError,
    LeftParsedShape,
    LeftConstructorInput,
    LeftConstructorError,
    LeftEncoded,
    LeftApi
  >,
  right: S.Schema<
    unknown,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >
): S.DefaultSchema<
  unknown,
  S.CompositionE<
    | S.PrevE<S.RefinementE<S.LeafE<S.ParseObjectE>>>
    | S.NextE<LeftParserError | ParserError>
  >,
  E.Either<LeftParsedShape, ParsedShape>,
  object,
  S.LeafE<S.UnknownArrayE>,
  E.Either<LeftEncoded, Encoded>,
  { left: LeftApi; right: Api }
> {
  const encodeLeft = Encoder.for(left)
  const encodeSelf = Encoder.for(right)
  return pipe(
    S.object[">>>"](fromEither(left, right)),
    S.encoder((_) => E.bimap_(_, encodeLeft, encodeSelf)),
    S.withDefaults,
    S.annotate(eitherIdentifier, { left, right })
  ) as any
}
