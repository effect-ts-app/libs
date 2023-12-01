/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
// tracing: off

import { pipe } from "@effect-app/core/Function"

import * as MO from "../custom.js"
import * as Arbitrary from "../custom/Arbitrary.js"
import * as Encoder from "../custom/Encoder.js"
import * as Guard from "../custom/Guard.js"
import * as Parser from "../custom/Parser.js"
import type { ParserEnv } from "../custom/Parser.js"
import * as Th from "../custom/These.js"

export const fromEitherIdentifier = MO.makeAnnotation<{
  left: MO.SchemaAny
  right: MO.SchemaAny
}>()

/**
 *  @experimental
 */
export function fromEither<
  LeftParserInput,
  LeftTo,
  LeftConstructorInput,
  LeftFrom,
  LeftApi,
  ParserInput,
  To,
  ConstructorInput,
  From,
  Api
>(
  left: MO.Schema<
    LeftParserInput,
    LeftTo,
    LeftConstructorInput,
    LeftFrom,
    LeftApi
  >,
  right: MO.Schema<ParserInput, To, ConstructorInput, From, Api>
): MO.DefaultSchema<
  object,
  Either<LeftTo, To>,
  object,
  Either<LeftFrom, From>,
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

  const refinement = (_: unknown): _ is Either<LeftTo, To> => {
    const ei = _ as Either<any, any>
    return (
      typeof _ === "object"
      && _ != null
      && ((ei.isLeft() && leftGuard(ei.left)) || (ei.isRight() && guard(ei.right)))
    )
  }

  const parseEither = (i: object, env?: ParserEnv) => {
    const ei = i as Either<any, any>
    if (ei.isLeft()) {
      const parsev2 = env?.cache ? env.cache.getOrSetParser(leftParse) : leftParse
      return Th.map_(parsev2(ei.left), Either.left)
    }
    if (ei.isRight()) {
      const parsev2 = env?.cache ? env.cache.getOrSetParser(parse) : parse
      return Th.map_(parsev2(ei.right), Either.right)
    }
    return Th.fail(MO.parseObjectE("not an either"))
  }

  return pipe(
    MO.identity(refinement),
    MO.arbitrary(
      (_) => _.oneof(leftArb(_).map(Either.left), arb(_).map(Either.right)) as any
    ),
    MO.parser(parseEither as any),
    MO.constructor(parseEither as any),
    MO.encoder((_) =>
      _.match({
        onLeft: (x) => ({ _tag: "Left", left: leftEncode(x) }),
        onRight: (x) => ({ _tag: "Right", right: encode(x) })
      })
    ),
    MO.mapApi(() => ({ left: left.Api, right: right.Api })),
    MO.withDefaults,
    MO.annotate(fromEitherIdentifier, { left, right })
  ) as any
}

export const eitherIdentifier = MO.makeAnnotation<{
  left: MO.SchemaAny
  right: MO.SchemaAny
}>()

/**
 *  @experimental
 */
export function either<
  LeftTo,
  LeftConstructorInput,
  LeftFrom,
  LeftApi,
  To,
  ConstructorInput,
  From,
  Api
>(
  left: MO.Schema<unknown, LeftTo, LeftConstructorInput, LeftFrom, LeftApi>,
  right: MO.Schema<unknown, To, ConstructorInput, From, Api>
): MO.DefaultSchema<
  unknown,
  Either<LeftTo, To>,
  object,
  Either<LeftFrom, From>,
  { left: LeftApi; right: Api }
> {
  const encodeLeft = Encoder.for(left)
  const encodeSelf = Encoder.for(right)
  return pipe(
    MO.object[">>>"](fromEither(left, right)),
    MO.encoder((_) =>
      _.mapBoth({
        onFailure: encodeLeft,
        onSuccess: encodeSelf
      })
    ),
    MO.withDefaults,
    MO.annotate(eitherIdentifier, { left, right })
  ) as any
}
