import { pipe } from "@effect-ts/core/Function"

import { makeAnnotation, parseBoolE } from "../_schema"
import * as S from "../_schema"
import * as Th from "../These"
import { refinement } from "./refinement"
import type { DefaultSchema } from "./withDefaults"
import { withDefaults } from "./withDefaults"

export const boolIdentifier = makeAnnotation<{}>()

export const bool: DefaultSchema<unknown, boolean, boolean, boolean, {}> = pipe(
  refinement(
    (u): u is boolean => typeof u === "boolean",
    (v) => S.leafE(parseBoolE(v))
  ),
  S.constructor((s: boolean) => Th.succeed(s)),
  S.arbitrary((_) => _.boolean()),
  S.encoder((s) => s),
  S.mapApi(() => ({})),
  withDefaults,
  S.annotate(boolIdentifier, {})
)
