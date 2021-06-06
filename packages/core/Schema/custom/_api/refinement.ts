// tracing: off

import * as Chunk from "@effect-ts/core/Collections/Immutable/Chunk"
import type { Refinement } from "@effect-ts/core/Function"
import { pipe } from "@effect-ts/core/Function"

import * as S from "../_schema"
import type { RefinementE } from "../_schema/error"
import { unknown } from "./unknown"
import type { DefaultSchema } from "./withDefaults"
import { withDefaults } from "./withDefaults"

export const refinementIdentifier =
  S.makeAnnotation<{
    refinement: Refinement<unknown, unknown>
    error: (value: unknown) => unknown
  }>()

export function refinement<E, NewParsedShape>(
  refinement: Refinement<unknown, NewParsedShape>,
  error: (value: unknown) => E
): DefaultSchema<
  unknown,
  RefinementE<E>,
  NewParsedShape,
  unknown,
  RefinementE<E>,
  unknown,
  {}
> {
  return pipe(
    unknown,
    S.refine(refinement, error),
    S.mapParserError((e) => Chunk.unsafeHead(e.errors).error),
    S.mapConstructorError((e) => Chunk.unsafeHead(e.errors).error),
    withDefaults,
    S.annotate(refinementIdentifier, { refinement, error })
  )
}
