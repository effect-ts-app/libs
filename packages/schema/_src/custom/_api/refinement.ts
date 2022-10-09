// tracing: off

import type { Refinement } from "@effect-ts/core/Function"
import { pipe } from "@effect-ts/core/Function"

import * as S from "../_schema/index.js"
//import type { RefinementE } from "../_schema/error.js"
import { unknown } from "./unknown.js"
import type { DefaultSchema } from "./withDefaults.js"
import { withDefaults } from "./withDefaults.js"

export const refinementIdentifier = S.makeAnnotation<{
  refinement: Refinement<unknown, unknown>
  error: (value: unknown) => unknown
}>()

export function refinement<E extends S.AnyError, NewParsedShape>(
  refinement: Refinement<unknown, NewParsedShape>,
  error: (value: unknown) => E
): DefaultSchema<unknown, NewParsedShape, unknown, unknown, {}> {
  return pipe(
    unknown,
    S.refine(refinement, error),
    S.mapParserError((e) => ((e as any).errors as Chunk<any>).unsafeHead.error),
    S.mapConstructorError((e) => ((e as any).errors as Chunk<any>).unsafeHead.error),
    withDefaults,
    S.annotate(refinementIdentifier, { refinement, error })
  )
}
