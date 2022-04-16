// tracing: off

import { pipe } from "@effect-ts/core/Function"

import * as S from "../_schema/index.js"
import * as Th from "../These/index.js"
import { refinement } from "./refinement.js"
import type { DefaultSchema } from "./withDefaults.js"
import { withDefaults } from "./withDefaults.js"

export const stringIdentifier = S.makeAnnotation<{}>()

export const string: DefaultSchema<unknown, string, string, string, {}> = pipe(
  refinement(
    (u): u is string => typeof u === "string",
    (v) => S.leafE(S.parseStringE(v))
  ),
  S.constructor((s: string) => Th.succeed(s)),
  S.arbitrary((_) => _.string()),
  S.encoder((s) => s),
  S.mapApi(() => ({})),
  withDefaults,
  S.annotate(stringIdentifier, {})
)

export const fromStringIdentifier = S.makeAnnotation<{}>()

export const fromString: DefaultSchema<string, string, string, string, {}> = pipe(
  S.identity((u): u is string => typeof u === "string"),
  S.arbitrary((_) => _.string()),
  S.mapApi(() => ({})),
  withDefaults,
  S.annotate(fromStringIdentifier, {})
)
