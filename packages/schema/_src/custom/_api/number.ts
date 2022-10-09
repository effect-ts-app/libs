// tracing: off

import { pipe } from "@effect-ts/core/Function"

import * as S from "../_schema/index.js"
import * as Th from "../These/index.js"
import { refinement } from "./refinement.js"
import { fromString, string } from "./string.js"
import type { DefaultSchema } from "./withDefaults.js"
import { withDefaults } from "./withDefaults.js"

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
        S.parser((s: string) =>
          pipe(Number.parseFloat(s), (n) =>
            Number.isNaN(n) ? Th.fail(S.leafE(S.parseNumberE(s))) : Th.succeed(n)
          )
        )
      )
    ),
    S.mapParserError((e) => ((e as any).errors as Chunk<any>).unsafeHead.error),
    withDefaults,
    S.annotate(stringNumberFromStringIdentifier, {})
  )

export const stringNumberIdentifier = S.makeAnnotation<{}>()

export const stringNumber: DefaultSchema<unknown, number, number, string, {}> = pipe(
  string[">>>"](stringNumberFromString),
  withDefaults,
  S.annotate(stringNumberIdentifier, {})
)
