// tracing: off

import { pipe } from "@effect-ts/core/Function"

import * as S from "../_schema"
import * as Th from "../These"
import { refinement } from "./refinement"
import type { DefaultSchema } from "./withDefaults"
import { withDefaults } from "./withDefaults"

export const stringIdentifier = S.makeAnnotation<{}>()

export const string: DefaultSchema<
  unknown,
  S.RefinementE<S.LeafE<S.ParseStringE>>,
  string,
  string,
  never,
  string,
  {}
> = pipe(
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

export const fromString: DefaultSchema<
  string,
  never,
  string,
  string,
  never,
  string,
  {}
> = pipe(
  S.identity((u): u is string => typeof u === "string"),
  S.arbitrary((_) => _.string()),
  S.mapApi(() => ({})),
  withDefaults,
  S.annotate(fromStringIdentifier, {})
)
