// tracing: off

import { pipe } from "@effect-app/core/Function"

import * as S from "../_schema.js"
import { brand } from "./brand.js"
import type { Int } from "./int.js"
import { intFromNumber, numberAsIntFromNumber } from "./int.js"
import { number } from "./number.js"
import type { Positive, PositiveExcludeZero } from "./positive.js"
import { positive, positiveExcludeZero } from "./positive.js"
import type { DefaultSchema } from "./withDefaults.js"

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
  positive("int"),
  S.arbitrary((FC) => FC.integer({ min: 0 }).map((_) => _ as PositiveInt)),
  brand<PositiveInt>()
)

export const positiveIntFromNumberAsInt: DefaultSchema<
  number,
  PositiveInt,
  number,
  number,
  S.ApiSelfType<PositiveInt>
> = pipe(
  numberAsIntFromNumber,
  positive("int"),
  S.arbitrary((FC) => FC.integer({ min: 0 }).map((_) => _ as PositiveInt)),
  brand<PositiveInt>()
)

export const positiveNumberAsInt: DefaultSchema<
  unknown,
  PositiveInt,
  number,
  number,
  S.ApiSelfType<PositiveInt>
> = pipe(
  number[">>>"](positiveIntFromNumberAsInt),
  brand<PositiveInt>()
)

export const positiveInt: DefaultSchema<
  unknown,
  PositiveInt,
  number,
  number,
  S.ApiSelfType<PositiveInt>
> = pipe(
  number[">>>"](positiveIntFromNumber),
  brand<PositiveInt>()
)

// customised
export type PositiveIntZeroExclusive = Int & PositiveExcludeZero

export const positiveIntZeroExclusiveFromNumber: DefaultSchema<
  number,
  PositiveIntZeroExclusive,
  number,
  number,
  S.ApiSelfType<PositiveIntZeroExclusive>
> = pipe(
  intFromNumber,
  positiveExcludeZero("int"),
  S.arbitrary((FC) => FC.integer({ min: 1 }).map((_) => _ as PositiveIntZeroExclusive)),
  brand<PositiveIntZeroExclusive>()
)

export const positiveIntZeroExclusiveIdentifier = S.makeAnnotation<{}>()

export const positiveIntZeroExclusive: DefaultSchema<
  unknown,
  PositiveIntZeroExclusive,
  number,
  number,
  S.ApiSelfType<PositiveIntZeroExclusive>
> = pipe(
  number[">>>"](positiveIntZeroExclusiveFromNumber),
  brand<PositiveIntZeroExclusive>()
)
