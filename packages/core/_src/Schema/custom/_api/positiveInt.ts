// tracing: off

import { pipe } from "@effect-ts/core/Function"

import * as S from "../_schema/index.js"
import { brand } from "./brand.js"
import type { Int } from "./int.js"
import { intFromNumber } from "./int.js"
import { number } from "./number.js"
import type { Positive } from "./positive.js"
import { positive } from "./positive.js"
import type { DefaultSchema } from "./withDefaults.js"

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
