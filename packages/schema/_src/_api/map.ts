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
  To,
  ConstructorInput,
  From,
  Api
>(
  key: MO.Schema<unknown, KeyParsedShape, KeyConstructorInput, KeyEncoded, KeyApi>,
  self: MO.Schema<unknown, To, ConstructorInput, From, Api>
): MO.DefaultSchema<
  unknown,
  ReadonlyMap<KeyParsedShape, To>,
  ReadonlyMap<KeyParsedShape, To>,
  readonly (readonly [KeyEncoded, From])[],
  {}
> {
  const keyGuard = Guard.for(key)

  const guard = Guard.for(self)

  const maparr = MO.array(tuple(key, self))
  const mapParse = Parser.for(maparr)
  const mapEncode = Encoder.for(maparr)
  const mapArb = Arbitrary.for(maparr)

  const refinement = (_: unknown): _ is ReadonlyMap<KeyParsedShape, To> =>
    _ instanceof Map
    && Array.from(_.entries()).every(([key, value]) => keyGuard(key) && guard(value))

  return pipe(
    MO.identity(refinement),
    MO.constructor((s: ReadonlyMap<KeyParsedShape, To>) => Th.succeed(s)),
    MO.arbitrary((_) => mapArb(_).map((x) => new Map(x))),
    MO.parser(
      (i: unknown, env?: ParserEnv) =>
        mapParse(i, env).pipe(
          Th.map((x) => new Map(x) as ReadonlyMap<KeyParsedShape, To>)
        )
    ),
    MO.encoder((_) => mapEncode(ReadonlyArray.fromIterable(_.entries()))),
    MO.mapApi(() => ({})),
    MO.withDefaults,
    MO.annotate(mapIdentifier, {})
  )
}
