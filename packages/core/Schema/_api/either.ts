/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
// tracing: off

import * as E from "@effect-ts/core/Either"
import { pipe } from "@effect-ts/core/Function"

import * as MO from "../custom.js"
import * as Arbitrary from "../custom/Arbitrary.js"
import * as Encoder from "../custom/Encoder.js"
import * as Guard from "../custom/Guard.js"
import * as Parser from "../custom/Parser.js"
import { ParserEnv } from "../custom/Parser.js"
import * as Th from "../custom/These.js"

export const fromEitherIdentifier =
  MO.makeAnnotation<{ left: MO.SchemaAny; right: MO.SchemaAny }>()

/**
 *  @experimental
 */
export function fromEither<
  LeftParserInput,
  LeftParsedShape,
  LeftConstructorInput,
  LeftEncoded,
  LeftApi,
  ParserInput,
  ParsedShape,
  ConstructorInput,
  Encoded,
  Api
>(
  left: MO.Schema<
    LeftParserInput,
    LeftParsedShape,
    LeftConstructorInput,
    LeftEncoded,
    LeftApi
  >,
  right: MO.Schema<ParserInput, ParsedShape, ConstructorInput, Encoded, Api>
): MO.DefaultSchema<
  object,
  E.Either<LeftParsedShape, ParsedShape>,
  object,
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

  const parseEither = (i: object, env?: ParserEnv) => {
    const ei = i as E.Either<any, any>
    if (E.isLeft(ei)) {
      const parsev2 = env?.cache ? env.cache.getOrSetParser(leftParse) : leftParse
      return Th.map_(parsev2(ei.left), E.left)
    }
    if (E.isRight(ei)) {
      const parsev2 = env?.cache ? env.cache.getOrSetParser(parse) : parse
      return Th.map_(parsev2(ei.right), E.right)
    }
    return Th.fail(MO.parseObjectE("not an either"))
  }

  return pipe(
    MO.identity(refinement),
    MO.arbitrary((_) => _.oneof(leftArb(_).map(E.left), arb(_).map(E.right)) as any),
    MO.parser(parseEither as any),
    MO.constructor(parseEither as any),
    MO.encoder((_) =>
      E.fold_(
        _,
        (x) => ({ _tag: "Left", left: leftEncode(x) }),
        (x) => ({ _tag: "Right", right: encode(x) })
      )
    ),
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
  LeftParsedShape,
  LeftConstructorInput,
  LeftEncoded,
  LeftApi,
  ParsedShape,
  ConstructorInput,
  Encoded,
  Api
>(
  left: MO.Schema<unknown, LeftParsedShape, LeftConstructorInput, LeftEncoded, LeftApi>,
  right: MO.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>
): MO.DefaultSchema<
  unknown,
  E.Either<LeftParsedShape, ParsedShape>,
  object,
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
