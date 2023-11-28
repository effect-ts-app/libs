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
import { tuple } from "./tuple.js"

export const mapIdentifier = MO.makeAnnotation<{}>()

export function map<
  KeyParsedShape,
  KeyConstructorInput,
  KeyEncoded,
  KeyApi,
  ParsedShape,
  ConstructorInput,
  Encoded,
  Api
>(
  key: MO.Schema<unknown, KeyParsedShape, KeyConstructorInput, KeyEncoded, KeyApi>,
  self: MO.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>
): MO.DefaultSchema<
  unknown,
  ReadonlyMap<KeyParsedShape, ParsedShape>,
  ReadonlyMap<KeyParsedShape, ParsedShape>,
  readonly (readonly [KeyEncoded, Encoded])[],
  {}
> {
  const keyGuard = Guard.for(key)

  const guard = Guard.for(self)

  const maparr = MO.array(tuple(key, self))
  const mapParse = Parser.for(maparr)
  const mapEncode = Encoder.for(maparr)
  const mapArb = Arbitrary.for(maparr)

  const refinement = (_: unknown): _ is ReadonlyMap<KeyParsedShape, ParsedShape> =>
    _ instanceof Map
    && Array.from(_.entries()).every(([key, value]) => keyGuard(key) && guard(value))

  return pipe(
    MO.identity(refinement),
    MO.constructor((s: ReadonlyMap<KeyParsedShape, ParsedShape>) => Th.succeed(s)),
    MO.arbitrary((_) => mapArb(_).map((x) => new Map(x))),
    MO.parser(
      (i: unknown, env?: ParserEnv) =>
        mapParse(i, env).pipe(
          Th.map((x) => new Map(x) as ReadonlyMap<KeyParsedShape, ParsedShape>)
        )
    ),
    MO.encoder((_) => mapEncode(ReadonlyArray.fromIterable(_.entries()))),
    MO.mapApi(() => ({})),
    MO.withDefaults,
    MO.annotate(mapIdentifier, {})
  )
}
