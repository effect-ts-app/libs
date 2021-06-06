// tracing: off

import * as Chunk from "@effect-ts/core/Collections/Immutable/Chunk"
import { pipe } from "@effect-ts/core/Function"

import * as S from "../_schema"
import * as Th from "../These"
import { refinement } from "./refinement"
import { fromString, string } from "./string"
import type { DefaultSchema } from "./withDefaults"
import { withDefaults } from "./withDefaults"

export const fromNumberIdentifier = S.makeAnnotation<{}>()

export const fromNumber: DefaultSchema<number, number, number, number, {}> = pipe(
  S.identity((u): u is number => typeof u === "number"),
  S.arbitrary((_) => _.double()),
  S.mapApi(() => ({})),
  withDefaults,
  S.annotate(fromNumberIdentifier, {})
)

export const numberIdentifier = S.makeAnnotation<{}>()

export const number: DefaultSchema<unknown, number, number, number, {}> = pipe(
  refinement(
    (u): u is number => typeof u === "number",
    (v) => S.leafE(S.parseNumberE(v))
  ),
  S.arbitrary((_) => _.double()),
  S.constructor((n: number) => Th.succeed(n)),
  S.encoder((_) => _),
  S.mapApi(() => ({})),
  withDefaults,
  S.annotate(numberIdentifier, {})
)

export const stringNumberFromStringIdentifier = S.makeAnnotation<{}>()

export const stringNumberFromString: DefaultSchema<string, number, number, string, {}> =
  pipe(
    fromString[">>>"](
      pipe(
        number,
        S.encoder((_) => String(_)),
        S.parser((s) =>
          pipe(Number.parseFloat(s), (n) =>
            Number.isNaN(n) ? Th.fail(S.leafE(S.parseNumberE(s))) : Th.succeed(n)
          )
        )
      )
    ),
    S.mapParserError((e) => (Chunk.unsafeHead((e as any).errors) as any).error),
    withDefaults,
    S.annotate(stringNumberFromStringIdentifier, {})
  )

export const stringNumberIdentifier = S.makeAnnotation<{}>()

export const stringNumber: DefaultSchema<unknown, number, number, string, {}> = pipe(
  string[">>>"](stringNumberFromString),
  withDefaults,
  S.annotate(stringNumberIdentifier, {})
)
