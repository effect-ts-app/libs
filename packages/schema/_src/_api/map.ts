/* eslint-disable @typescript-eslint/ban-types */
// tracing: off

import { pipe } from "@effect-app/core/Function"

import * as S from "../custom.js"
import * as Arbitrary from "../custom/Arbitrary.js"
import * as Encoder from "../custom/Encoder.js"
import * as Guard from "../custom/Guard.js"
import * as Parser from "../custom/Parser.js"
import type { ParserEnv } from "../custom/Parser.js"
import * as Th from "../custom/These.js"
import { tuple } from "./tuple.js"

export const mapIdentifier = S.makeAnnotation<{}>()

export function map<
  KeyTo,
  KeyConstructorInput,
  KeyFrom,
  KeyApi,
  To,
  ConstructorInput,
  From,
  Api
>(
  key: S.Schema<unknown, KeyTo, KeyConstructorInput, KeyFrom, KeyApi>,
  self: S.Schema<unknown, To, ConstructorInput, From, Api>
): S.DefaultSchema<
  unknown,
  ReadonlyMap<KeyTo, To>,
  ReadonlyMap<KeyTo, To>,
  readonly (readonly [KeyFrom, From])[],
  {}
> {
  const keyGuard = Guard.for(key)

  const guard = Guard.for(self)

  const maparr = S.array(tuple(key, self))
  const mapParse = Parser.for(maparr)
  const mapEncode = Encoder.for(maparr)
  const mapArb = Arbitrary.for(maparr)

  const refinement = (_: unknown): _ is ReadonlyMap<KeyTo, To> =>
    _ instanceof Map
    && Array.from(_.entries()).every(([key, value]) => keyGuard(key) && guard(value))

  return pipe(
    S.identity(refinement),
    S.constructor((s: ReadonlyMap<KeyTo, To>) => Th.succeed(s)),
    S.arbitrary((_) => mapArb(_).map((x) => new Map(x))),
    S.parser(
      (i: unknown, env?: ParserEnv) =>
        mapParse(i, env).pipe(
          Th.map((x) => new Map(x) as ReadonlyMap<KeyTo, To>)
        )
    ),
    S.encoder((_) => mapEncode(ReadonlyArray.fromIterable(_.entries()))),
    S.mapApi(() => ({})),
    S.withDefaults,
    S.annotate(mapIdentifier, {})
  )
}
