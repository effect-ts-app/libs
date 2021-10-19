// tracing: off

import { pipe } from "@effect-ts/core/Function"

import * as S from "../_schema"
import { brand } from "./brand"
import type { Int } from "./int"
import { intFromNumber } from "./int"
import { number } from "./number"
import type { Positive } from "./positive"
import { positive } from "./positive"
import type { DefaultSchema } from "./withDefaults"

export const positiveIntFromNumberIdentifier = S.makeAnnotation<{}>()

// customised
export type PositiveInt = Int & Positive

export const positiveIntFromNumber: DefaultSchema<
  number,
  PositiveInt,
  number,
  number,
  S.ApiSelfType<PositiveInt>
> = pipe(
  intFromNumber,
  positive,
  S.arbitrary((FC) => FC.integer({ min: 1 }).map((_) => _ as PositiveInt)),
  brand<PositiveInt>(),
  S.annotate(positiveIntFromNumberIdentifier, {})
)

export const positiveIntIdentifier = S.makeAnnotation<{}>()

export const positiveInt: DefaultSchema<
  unknown,
  PositiveInt,
  number,
  number,
  S.ApiSelfType<PositiveInt>
> = pipe(
  number[">>>"](positiveIntFromNumber),
  brand<PositiveInt>(),
  S.annotate(positiveIntIdentifier, {})
)
