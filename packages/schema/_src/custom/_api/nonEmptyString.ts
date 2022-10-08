// tracing: off

import { pipe } from "@effect-ts/core/Function"

import * as S from "../_schema/index.js"
import { brand } from "./brand.js"
import type { NonEmptyBrand } from "./nonEmpty.js"
import { nonEmpty } from "./nonEmpty.js"
import { fromString, string } from "./string.js"
import type { DefaultSchema } from "./withDefaults.js"

export type NonEmptyString = string & NonEmptyBrand

export const nonEmptyStringFromStringIdentifier = S.makeAnnotation<{}>()

export const nonEmptyStringFromString: DefaultSchema<
  string,
  NonEmptyString,
  string,
  string,
  {}
> = pipe(
  fromString,
  S.arbitrary((FC) => FC.string({ minLength: 1 })),
  nonEmpty,
  S.mapParserError((_) => (((_ as any).errors) as Chunk<any>).unsafeHead.error),
  S.mapConstructorError((_) => (((_ as any).errors) as Chunk<any>).unsafeHead.error),
  brand<NonEmptyString>(),
  S.annotate(nonEmptyStringFromStringIdentifier, {})
)

export const nonEmptyStringIdentifier = S.makeAnnotation<{}>()

export const nonEmptyString: DefaultSchema<
  unknown,
  NonEmptyString,
  string,
  string,
  S.ApiSelfType<NonEmptyString>
> = pipe(
  string[">>>"](nonEmptyStringFromString),
  brand<NonEmptyString>(),
  S.annotate(nonEmptyStringIdentifier, {})
)
