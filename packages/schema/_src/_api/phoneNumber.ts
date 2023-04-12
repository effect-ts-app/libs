/* eslint-disable @typescript-eslint/ban-types */

import { pipe } from "@effect-app/core/Function"
import { isValidPhone } from "@effect-app/core/validation"

import * as MO from "../_schema.js"
import type { DefaultSchema, NonEmptyString } from "../_schema.js"
import { brand, customE, fromString, string } from "../_schema.js"
import { Numbers } from "../FastCheck.js"
import { extendWithUtils } from "./_shared.js"

// TODO: openapi meta: format: phone

export interface PhoneNumberBrand {
  readonly PhoneNumber: unique symbol
}

export type PhoneNumber = NonEmptyString & PhoneNumberBrand

export const PhoneNumberFromStringIdentifier = MO.makeAnnotation<{}>()

function isPhoneNumber(str: string): str is PhoneNumber {
  return isValidPhone(str)
}

export const PhoneNumberFromString: DefaultSchema<
  string,
  PhoneNumber,
  string,
  string,
  {}
> = pipe(
  fromString,
  MO.arbitrary((FC) => Numbers(7, 10)(FC)),
  MO.refine(isPhoneNumber, (n) => MO.leafE(customE(n, "a valid phone number"))),
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
