// tracing: off

import { pipe } from "@effect-ts/core/Function"

import * as S from "../_schema"
import { annotate, identity } from "../_schema"
import type { DefaultSchema } from "./withDefaults"
import { withDefaults } from "./withDefaults"

export const unknownIdentifier = S.makeAnnotation<{}>()

export const unknown: DefaultSchema<
  unknown,
  never,
  unknown,
  unknown,
  never,
  unknown,
  {}
> = pipe(
  identity((_): _ is unknown => true),
  withDefaults,
  annotate(unknownIdentifier, {})
)
