/* eslint-disable @typescript-eslint/ban-types */
import * as CNK from "@effect-ts/core/Collections/Immutable/Chunk"

import { Numbers } from "../../FastCheck"
import { pipe, Refinement } from "../../Function"
import { isValidPhone } from "../../validation"
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
import { extendWithUtils } from "./string"

// TODO: openapi meta: format: phone

export interface PhoneNumberBrand {
  readonly PhoneNumber: unique symbol
}

export type PhoneNumber = NonEmptyString & PhoneNumberBrand

export const PhoneNumberFromStringIdentifier = MO.makeAnnotation<{}>()

const isPhoneNumber: Refinement<string, PhoneNumber> = (
  s: string
): s is PhoneNumber => {
  return isValidPhone(s)
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
  nonEmpty,
  MO.mapParserError((_) => (CNK.unsafeHead((_ as any).errors) as any).error),
  MO.mapConstructorError((_) => (CNK.unsafeHead((_ as any).errors) as any).error),
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
