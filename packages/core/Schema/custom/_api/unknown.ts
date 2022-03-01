// tracing: off

import { pipe } from "@effect-ts/core/Function"

import * as S from "../_schema/index.js"
import { annotate, identity, named } from "../_schema/index.js"
import type { DefaultSchema } from "./withDefaults.js"
import { withDefaults } from "./withDefaults.js"

export const unknownIdentifier = S.makeAnnotation<{}>()

export const unknown: DefaultSchema<unknown, unknown, unknown, unknown, {}> = pipe(
  identity((_): _ is unknown => true),
  named("unknown"),
  withDefaults,
  annotate(unknownIdentifier, {})
)
