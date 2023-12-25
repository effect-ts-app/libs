/* eslint-disable @typescript-eslint/ban-types */

import { pipe } from "@effect-app/core/Function"
import { isValidPhone } from "@effect-app/core/validation"

import * as S from "../_schema.js"
import type { DefaultSchema, NonEmptyString } from "../_schema.js"
import { brand, customE, fromString, string } from "../_schema.js"
import { Numbers } from "../FastCheck.js"
import { extendWithUtils } from "./_shared.js"

// TODO: openapi meta: format: phone

export interface PhoneNumberBrand {
  readonly PhoneNumber: unique symbol
}

export type PhoneNumber = NonEmptyString & PhoneNumberBrand

export const PhoneNumberFromStringIdentifier = S.makeAnnotation<{}>()

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
  S.arbitrary((FC) => Numbers(7, 10)(FC)),
  S.refine(isPhoneNumber, (n) => S.leafE(customE(n, "a valid phone number"))),
  brand<PhoneNumber>(),
  S.annotate(PhoneNumberFromStringIdentifier, {})
)

export const PhoneNumberIdentifier = S.makeAnnotation<{}>()

export const PhoneNumber = extendWithUtils(
  pipe(
    string[">>>"](PhoneNumberFromString),
    brand<PhoneNumber>(),
    S.annotate(PhoneNumberIdentifier, {})
  )
)
