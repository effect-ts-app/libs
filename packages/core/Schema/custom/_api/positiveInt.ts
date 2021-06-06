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

export const positiveIntFromNumber: DefaultSchema<
  number,
  Int & Positive,
  number,
  number,
  S.ApiSelfType<Int & Positive>
> = pipe(
  intFromNumber,
  positive,
  S.arbitrary((FC) => FC.integer({ min: 1 }).map((_) => _ as Int & Positive)),
  brand<Int & Positive>(),
  S.annotate(positiveIntFromNumberIdentifier, {})
)

export const positiveIntIdentifier = S.makeAnnotation<{}>()

export const positiveInt: DefaultSchema<
  unknown,
  Int & Positive,
  number,
  number,
  S.ApiSelfType<Int & Positive>
> = pipe(
  number[">>>"](positiveIntFromNumber),
  brand<Int & Positive>(),
  S.annotate(positiveIntIdentifier, {})
)
