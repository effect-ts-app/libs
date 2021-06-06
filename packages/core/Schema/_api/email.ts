/* eslint-disable @typescript-eslint/ban-types */
import * as CNK from "@effect-ts/core/Collections/Immutable/Chunk"

import { pipe, Refinement } from "../../Function"
import { isValidEmail } from "../../validation"
import * as MO from "../_schema"
import {
  brand,
  DefaultSchema,
  fromString,
  nonEmpty,
  NonEmptyString,
  parseUuidE,
  string,
} from "../_schema"

// TODO: openapi meta: format: email

export interface EmailBrand {
  readonly Email: unique symbol
}

export type Email = NonEmptyString & EmailBrand

export const EmailFromStringIdentifier = MO.makeAnnotation<{}>()

const isEmail: Refinement<string, Email> = (s: string): s is Email => {
  return isValidEmail(s)
}

export const EmailFromString: DefaultSchema<string, Email, string, string, {}> = pipe(
  fromString,
  MO.arbitrary((FC) => FC.emailAddress()),
  nonEmpty,
  MO.mapParserError((_) => (CNK.unsafeHead((_ as any).errors) as any).error),
  MO.mapConstructorError((_) => (CNK.unsafeHead((_ as any).errors) as any).error),
  MO.refine(isEmail, (n) => MO.leafE(parseUuidE(n))),
  brand<Email>(),
  MO.annotate(EmailFromStringIdentifier, {})
)

export const EmailIdentifier = MO.makeAnnotation<{}>()

export const Email: DefaultSchema<
  unknown,
  Email,
  string,
  string,
  MO.ApiSelfType<Email>
> = pipe(
  string[">>>"](EmailFromString),
  brand<Email>(),
  MO.annotate(EmailIdentifier, {})
)
