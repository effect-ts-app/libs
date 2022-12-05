/* eslint-disable @typescript-eslint/ban-types */

import { pipe } from "@effect-ts-app/core/Function"
import { isValidEmail } from "@effect-ts-app/core/validation"

import * as MO from "../_schema.js"
import type { DefaultSchema, NonEmptyString } from "../_schema.js"
import { brand, customE, fromString, string } from "../_schema.js"
import { extendWithUtils } from "./_shared.js"

// TODO: openapi meta: format: email

export interface EmailBrand {
  readonly Email: unique symbol
}

export type Email = NonEmptyString & EmailBrand

export const EmailFromStringIdentifier = MO.makeAnnotation<{}>()

function isEmail(str: string): str is Email {
  return isValidEmail(str)
}

export const EmailFromString: DefaultSchema<string, Email, string, string, {}> = pipe(
  fromString,
  MO.arbitrary(FC => FC.emailAddress()),
  MO.refine(isEmail, n => MO.leafE(customE(n, "a valid Email according to RFC 5322"))),
  brand<Email>(),
  MO.annotate(EmailFromStringIdentifier, {})
)

export const EmailIdentifier = MO.makeAnnotation<{}>()

export const Email = extendWithUtils(
  pipe(string[">>>"](EmailFromString), brand<Email>(), MO.annotate(EmailIdentifier, {}))
)
