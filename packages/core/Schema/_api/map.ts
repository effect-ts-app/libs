/* eslint-disable @typescript-eslint/ban-types */
// tracing: off

import { Map } from "@effect-ts/core/Collections/Immutable/Map"
import { pipe } from "@effect-ts/core/Function"
import * as MO from "@effect-ts/schema"
import * as Arbitrary from "@effect-ts/schema/Arbitrary"
import * as Encoder from "@effect-ts/schema/Encoder"
import * as Guard from "@effect-ts/schema/Guard"
import * as Parser from "@effect-ts/schema/Parser"
import * as Th from "@effect-ts/schema/These"

import { tuple } from "./tuple"

export const mapIdentifier = MO.makeAnnotation<{}>()

export function map<
  KeyParserError extends MO.AnyError,
  KeyParsedShape,
  KeyConstructorInput,
  KeyConstructorError extends MO.AnyError,
  KeyEncoded,
  KeyApi,
  ParserError extends MO.AnyError,
  ParsedShape,
  ConstructorInput,
  ConstructorError extends MO.AnyError,
  Encoded,
  Api
>(
  key: MO.Schema<
    unknown,
    KeyParserError,
    KeyParsedShape,
    KeyConstructorInput,
    KeyConstructorError,
    KeyEncoded,
    KeyApi
  >,
  self: MO.Schema<
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
  MO.AnyError,
  Map<KeyParsedShape, ParsedShape>,
  Map<KeyParsedShape, ParsedShape>,
  never,
  readonly (readonly [KeyEncoded, Encoded])[],
  {}
> {
  const keyGuard = Guard.for(key)

  const guard = Guard.for(self)

  const maparr = MO.array(tuple(key, self))
  const mapParse = Parser.for(maparr)
  const mapEncode = Encoder.for(maparr)
  const mapArb = Arbitrary.for(maparr)

  const refinement = (_: unknown): _ is Map<KeyParsedShape, ParsedShape> =>
    _ instanceof Map &&
    Array.from(_.entries()).every(([key, value]) => keyGuard(key) && guard(value))

  return pipe(
    MO.identity(refinement),
    MO.constructor((s: Map<KeyParsedShape, ParsedShape>) => Th.succeed(s)),
    MO.arbitrary((_) => mapArb(_).map((x) => new Map(x))),
    MO.parser((i: unknown) =>
      mapParse(i)["|>"](Th.map((x) => new Map(x) as Map<KeyParsedShape, ParsedShape>))
    ),
    MO.encoder((_) => Array.from(_.entries())["|>"](mapEncode)),
    MO.mapApi(() => ({})),
    MO.withDefaults,
    MO.annotate(mapIdentifier, {})
  )
}
