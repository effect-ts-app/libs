/* eslint-disable @typescript-eslint/ban-types */

import { pipe } from "@effect-app/core/Function"
import { isValidEmail } from "@effect-app/core/validation"

import * as S from "../_schema.js"
import type { DefaultSchema, NonEmptyString } from "../_schema.js"
import { brand, customE, fromString, string } from "../_schema.js"
import { extendWithUtils } from "./_shared.js"

// TODO: openapi meta: format: email

export interface EmailBrand {
  readonly Email: unique symbol
}

export type Email = NonEmptyString & EmailBrand

export const EmailFromStringIdentifier = S.makeAnnotation<{}>()

function isEmail(str: string): str is Email {
  return isValidEmail(str)
}

export const EmailFromString: DefaultSchema<string, Email, string, string, {}> = pipe(
  fromString,
  S.arbitrary((FC) => FC.emailAddress()),
  S.refine(isEmail, (n) => S.leafE(customE(n, "a valid Email according to RFC 5322"))),
  brand<Email>(),
  S.annotate(EmailFromStringIdentifier, {})
)

export const EmailIdentifier = S.makeAnnotation<{}>()

export const Email = extendWithUtils(
  pipe(string[">>>"](EmailFromString), brand<Email>(), S.annotate(EmailIdentifier, {}))
)
