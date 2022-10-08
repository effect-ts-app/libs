/* eslint-disable @typescript-eslint/ban-types */

import { pipe, Refinement } from "@effect-ts-app/core/Function"
import { isValidEmail } from "@effect-ts-app/core/validation"

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
import { extendWithUtils } from "./_shared.js"

// TODO: openapi meta: format: email

export interface EmailBrand {
  readonly Email: unique symbol
}

export type Email = NonEmptyString & EmailBrand

export const EmailFromStringIdentifier = MO.makeAnnotation<{}>()

const isEmail: Refinement<string, Email> = isValidEmail as any

export const EmailFromString: DefaultSchema<string, Email, string, string, {}> = pipe(
  fromString,
  MO.arbitrary((FC) => FC.emailAddress()),
  nonEmpty,
  MO.mapParserError((_) => ((_ as any).errors as Chunk<any>).unsafeHead.error),
  MO.mapConstructorError((_) => ((_ as any).errors as Chunk<any>).unsafeHead.error),
  MO.refine(isEmail, (n) => MO.leafE(parseUuidE(n))),
  brand<Email>(),
  MO.annotate(EmailFromStringIdentifier, {})
)

export const EmailIdentifier = MO.makeAnnotation<{}>()

export const Email = extendWithUtils(
  pipe(string[">>>"](EmailFromString), brand<Email>(), MO.annotate(EmailIdentifier, {}))
)
