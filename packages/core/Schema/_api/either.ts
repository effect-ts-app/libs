/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
// tracing: off

import * as E from "@effect-ts/core/Either"
import { pipe } from "@effect-ts/core/Function"
import * as MO from "@effect-ts/schema"
import * as Arbitrary from "@effect-ts/schema/Arbitrary"
import * as Encoder from "@effect-ts/schema/Encoder"
import * as Guard from "@effect-ts/schema/Guard"
import * as Parser from "@effect-ts/schema/Parser"
import * as Th from "@effect-ts/schema/These"

export const fromEitherIdentifier =
  MO.makeAnnotation<{ left: MO.SchemaAny; right: MO.SchemaAny }>()

/**
 *  @experimental
 */
export function fromEither<
  LeftParserInput,
  LeftParserError extends MO.AnyError,
  LeftParsedShape,
  LeftConstructorInput,
  LeftConstructorError extends MO.AnyError,
  LeftEncoded,
  LeftApi,
  ParserInput,
  ParserError extends MO.AnyError,
  ParsedShape,
  ConstructorInput,
  ConstructorError extends MO.AnyError,
  Encoded,
  Api
>(
  left: MO.Schema<
    LeftParserInput,
    LeftParserError,
    LeftParsedShape,
    LeftConstructorInput,
    LeftConstructorError,
    LeftEncoded,
    LeftApi
  >,
  right: MO.Schema<
    ParserInput,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >
): MO.DefaultSchema<
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
    return Th.fail(MO.parseObjectE("not an either"))
  }

  return pipe(
    MO.identity(refinement),
    MO.arbitrary((_) => _.oneof(leftArb(_).map(E.left), arb(_).map(E.right)) as any),
    MO.parser(parseEither as any),
    MO.constructor(parseEither as any),
    MO.encoder((_) => E.bimap_(_, leftEncode, encode)),
    MO.mapApi(() => ({ left: left.Api, right: right.Api })),
    MO.withDefaults,
    MO.annotate(fromEitherIdentifier, { left, right })
  ) as any
}

export const eitherIdentifier =
  MO.makeAnnotation<{ left: MO.SchemaAny; right: MO.SchemaAny }>()

/**
 *  @experimental
 */
export function either<
  LeftParserError extends MO.AnyError,
  LeftParsedShape,
  LeftConstructorInput,
  LeftConstructorError extends MO.AnyError,
  LeftEncoded,
  LeftApi,
  ParserError extends MO.AnyError,
  ParsedShape,
  ConstructorInput,
  ConstructorError extends MO.AnyError,
  Encoded,
  Api
>(
  left: MO.Schema<
    unknown,
    LeftParserError,
    LeftParsedShape,
    LeftConstructorInput,
    LeftConstructorError,
    LeftEncoded,
    LeftApi
  >,
  right: MO.Schema<
    unknown,
    ParserError,
    ParsedShape,
    ConstructorInput,
    ConstructorError,
    Encoded,
    Api
  >
): MO.DefaultSchema<
  unknown,
  MO.CompositionE<
    | MO.PrevE<MO.RefinementE<MO.LeafE<MO.ParseObjectE>>>
    | MO.NextE<LeftParserError | ParserError>
  >,
  E.Either<LeftParsedShape, ParsedShape>,
  object,
  MO.LeafE<MO.UnknownArrayE>,
  E.Either<LeftEncoded, Encoded>,
  { left: LeftApi; right: Api }
> {
  const encodeLeft = Encoder.for(left)
  const encodeSelf = Encoder.for(right)
  return pipe(
    MO.object[">>>"](fromEither(left, right)),
    MO.encoder((_) => E.bimap_(_, encodeLeft, encodeSelf)),
    MO.withDefaults,
    MO.annotate(eitherIdentifier, { left, right })
  ) as any
}
