/* eslint-disable @typescript-eslint/ban-types */
import * as CNK from "@effect-ts/core/Collections/Immutable/Chunk"

import { Numbers } from "../../FastCheck"
import { pipe, Refinement } from "../../Function"
import { isValidPhone } from "../../validation"
import * as S from "../_schema"
import {
  brand,
  DefaultSchema,
  fromString,
  nonEmpty,
  NonEmptyString,
  parseUuidE,
  string,
} from "../_schema"

// TODO: openapi meta: format: phone

export interface PhoneNumberBrand {
  readonly PhoneNumber: unique symbol
}

export type PhoneNumber = NonEmptyString & PhoneNumberBrand

export const PhoneNumberFromStringIdentifier = S.makeAnnotation<{}>()

const isPhoneNumber: Refinement<string, PhoneNumber> = (
  s: string
): s is PhoneNumber => {
  return isValidPhone(s)
}

export const PhoneNumberFromString: DefaultSchema<
  string,
  S.CompositionE<
    | S.NextE<S.RefinementE<S.LeafE<S.ParseUuidE>>>
    | S.PrevE<S.RefinementE<S.LeafE<S.NonEmptyE<string>>>>
  >,
  PhoneNumber,
  string,
  S.CompositionE<
    | S.NextE<S.RefinementE<S.LeafE<S.ParseUuidE>>>
    | S.PrevE<S.RefinementE<S.LeafE<S.NonEmptyE<string>>>>
  >,
  string,
  {}
> = pipe(
  fromString,
  S.arbitrary((FC) => Numbers(7, 10)(FC)),
  nonEmpty,
  S.mapParserError((_) => CNK.unsafeHead(_.errors).error),
  S.mapConstructorError((_) => CNK.unsafeHead(_.errors).error),
  S.refine(isPhoneNumber, (n) => S.leafE(parseUuidE(n))),
  brand<PhoneNumber>(),
  S.annotate(PhoneNumberFromStringIdentifier, {})
)

export const PhoneNumberIdentifier = S.makeAnnotation<{}>()

export const PhoneNumber: DefaultSchema<
  unknown,
  S.CompositionE<
    | S.PrevE<S.RefinementE<S.LeafE<S.ParseStringE>>>
    | S.NextE<
        S.CompositionE<
          | S.NextE<S.RefinementE<S.LeafE<S.ParseUuidE>>>
          | S.PrevE<S.RefinementE<S.LeafE<S.NonEmptyE<string>>>>
        >
      >
  >,
  PhoneNumber,
  string,
  S.CompositionE<
    | S.NextE<S.RefinementE<S.LeafE<S.ParseUuidE>>>
    | S.PrevE<S.RefinementE<S.LeafE<S.NonEmptyE<string>>>>
  >,
  string,
  S.ApiSelfType<PhoneNumber>
> = pipe(
  string[">>>"](PhoneNumberFromString),
  brand<PhoneNumber>(),
  S.annotate(PhoneNumberIdentifier, {})
)
