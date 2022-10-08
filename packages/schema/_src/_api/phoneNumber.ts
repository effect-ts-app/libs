/* eslint-disable @typescript-eslint/ban-types */

import { pipe, Refinement } from "@effect-ts-app/core/Function"
import { isValidPhone } from "@effect-ts-app/core/validation"

import * as MO from "../_schema.js"
import {
  brand,
  DefaultSchema,
  fromString,
  nonEmpty,
  NonEmptyString,
  parseUuidE,
  string,
} from "../_schema.js"
import { Numbers } from "../FastCheck.js"
import { extendWithUtils } from "./_shared.js"

// TODO: openapi meta: format: phone

export interface PhoneNumberBrand {
  readonly PhoneNumber: unique symbol
}

export type PhoneNumber = NonEmptyString & PhoneNumberBrand

export const PhoneNumberFromStringIdentifier = MO.makeAnnotation<{}>()

const isPhoneNumber: Refinement<string, PhoneNumber> = isValidPhone as any

export const PhoneNumberFromString: DefaultSchema<
  string,
  PhoneNumber,
  string,
  string,
  {}
> = pipe(
  fromString,
  MO.arbitrary((FC) => Numbers(7, 10)(FC)),
  nonEmpty,
  MO.mapParserError((_) => (((_ as any).errors) as Chunk<any>).unsafeHead.error),
  MO.mapConstructorError((_) => (((_ as any).errors) as Chunk<any>).unsafeHead.error),
  MO.refine(isPhoneNumber, (n) => MO.leafE(parseUuidE(n))),
  brand<PhoneNumber>(),
  MO.annotate(PhoneNumberFromStringIdentifier, {})
)

export const PhoneNumberIdentifier = MO.makeAnnotation<{}>()

export const PhoneNumber = extendWithUtils(
  pipe(
    string[">>>"](PhoneNumberFromString),
    brand<PhoneNumber>(),
    MO.annotate(PhoneNumberIdentifier, {})
  )
)
